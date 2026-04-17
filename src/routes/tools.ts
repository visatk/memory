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

// Network Resolution Engine
function getCardNetworkSpecs(bin: string) {
  if (bin.startsWith('34') || bin.startsWith('37')) {
    return { network: 'American Express', length: 15, cvvLength: 4 };
  }
  if (bin.startsWith('4')) {
    return { network: 'Visa', length: 16, cvvLength: 3 };
  }
  if (/^5[1-5]/.test(bin) || /^2[2-7]/.test(bin)) {
    return { network: 'Mastercard', length: 16, cvvLength: 3 };
  }
  if (bin.startsWith('6')) {
    return { network: 'Discover', length: 16, cvvLength: 3 };
  }
  if (bin.startsWith('35')) {
    return { network: 'JCB', length: 16, cvvLength: 3 };
  }
  if (/^3(?:0[0-5]|[68])/.test(bin)) {
    return { network: 'Diners Club', length: 14, cvvLength: 3 };
  }
  // Fallback for unknown / custom internal BINs
  return { network: 'Unknown/Custom', length: 16, cvvLength: 3 };
}

// Structurally Perfect Luhn Generator
function generateLuhnValidNumber(bin: string, totalLength: number): string {
  let cardNumber = bin;
  
  // Fill the remaining length with random digits (reserving 1 space for the check digit)
  while (cardNumber.length < totalLength - 1) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }

  // Calculate Luhn check digit securely
  let sum = 0;
  let isEven = true; // Since we are iterating right-to-left starting from the digit *before* the check digit
  
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

  // If the provided BIN is already exactly or longer than the required length, 
  // we truncate it to length - 1 so we can append the valid check digit.
  const baseBin = bin.length >= specs.length ? bin.substring(0, specs.length - 1) : bin;

  for (let i = 0; i < quantity; i++) {
    const number = generateLuhnValidNumber(baseBin, specs.length);
    
    // Generate valid future expiry date (Current Year to +5 years)
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const year = String(currentYear + Math.floor(Math.random() * 6)); 
    
    // Generate secure CVV vector matching network standards
    const cvv = Array.from({ length: specs.cvvLength }, () => Math.floor(Math.random() * 10)).join('');

    generatedCards.push({
      network: specs.network,
      number,
      expMonth: month,
      expYear: year,
      cvv,
      // Provide pre-formatted strings for rapid QA testing
      formattedString: `${number}|${month}|${year}|${cvv}`
    });
  }

  return c.json({ 
    success: true,
    metadata: {
      baseBin,
      networkDetected: specs.network,
      vectorLength: specs.length
    },
    cards: generatedCards 
  });
});
