import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const toolsRouter = new Hono();

// Strict validation for our Edge API
const generateCardsSchema = z.object({
  bin: z.string()
    .min(6, "BIN must be at least 6 digits")
    .max(16, "BIN cannot exceed 16 digits")
    .regex(/^[0-9]+$/, "BIN must contain only numbers"),
  quantity: z.number().min(1).max(100).default(10)
});

// Standard Luhn Algorithm Implementation
function generateLuhnValidNumber(bin: string, totalLength: number): string {
  let cardNumber = bin;
  
  // Fill the remaining length with random digits (reserving 1 space for the check digit)
  while (cardNumber.length < totalLength - 1) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }

  // Calculate Luhn check digit
  let sum = 0;
  for (let i = 0; i < cardNumber.length; i++) {
    let digit = parseInt(cardNumber.charAt(cardNumber.length - 1 - i), 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return cardNumber + checkDigit;
}

toolsRouter.post('/generate-cards', zValidator('json', generateCardsSchema), (c) => {
  const { bin, quantity } = c.req.valid('json');

  // American Express cards are 15 digits with a 4-digit CVV. Standard cards are 16 digits with a 3-digit CVV.
  const isAmex = bin.startsWith('34') || bin.startsWith('37');
  const cardLength = isAmex ? 15 : 16;
  const cvvLength = isAmex ? 4 : 3;

  const currentYear = new Date().getFullYear();
  const generatedCards: string[] = [];

  for (let i = 0; i < quantity; i++) {
    const number = generateLuhnValidNumber(bin, cardLength);
    
    // Generate valid future expiry date (01-12 month, Current Year to +5 years)
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const year = String(currentYear + Math.floor(Math.random() * 6)); 
    
    // Generate CVV
    const cvv = Array.from({ length: cvvLength }, () => Math.floor(Math.random() * 10)).join('');

    // Requested Format: cardnumber|exp month|Year|cvv
    generatedCards.push(`${number}|${month}|${year}|${cvv}`);
  }

  return c.json({ cards: generatedCards });
});
