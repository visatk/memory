import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const toolsRouter = new Hono();

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
