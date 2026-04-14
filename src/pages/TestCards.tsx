import { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

const CARD_NETWORKS = {
  visa: { name: 'Visa', prefix: '4242', length: 16 },
  mastercard: { name: 'Mastercard', prefix: '5555', length: 16 },
  amex: { name: 'American Express', prefix: '3782', length: 15 },
  discover: { name: 'Discover', prefix: '6011', length: 16 }
};

export default function TestCards() {
  const [network, setNetwork] = useState<keyof typeof CARD_NETWORKS>('visa');
  const [generatedCard, setGeneratedCard] = useState('');
  const { copiedText, copy } = useCopyToClipboard();

  const generateCard = () => {
    const config = CARD_NETWORKS[network];
    let number = config.prefix;
    // Generate random digits to fill the length (minus 1 for the Luhn check digit)
    while (number.length < config.length - 1) {
      number += Math.floor(Math.random() * 10).toString();
    }
    
    // Luhn Algorithm calculation for the final digit
    let sum = 0;
    for (let i = 0; i < number.length; i++) {
      let digit = parseInt(number.charAt(number.length - 1 - i), 10);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    const finalCard = number + checkDigit;
    
    // Format with spaces for UX
    const formatted = finalCard.match(new RegExp(`.{1,4}`, 'g'))?.join(' ') || finalCard;
    setGeneratedCard(formatted);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <SeoHead 
        title="Test Credit Card Generator" 
        description="Generate valid dummy credit card numbers for Stripe, Braintree, and QA testing. Instant, client-side, and secure." 
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Test Card Generator</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Generate valid dummy payment cards for gateway testing.</p>
      </div>

      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(CARD_NETWORKS).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setNetwork(key as keyof typeof CARD_NETWORKS)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                network === key 
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' 
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {data.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              readOnly 
              value={generatedCard}
              placeholder={`Click generate for a ${CARD_NETWORKS[network].name} card...`}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4 font-mono text-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={generateCard}
              className="flex-1 md:flex-none px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors cursor-pointer"
            >
              Generate
            </button>
            <button 
              onClick={() => copy(generatedCard.replace(/\s/g, ''))}
              disabled={!generatedCard}
              className={`px-6 py-4 font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                copiedText 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'
              }`}
            >
              {copiedText ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 grid grid-cols-3 gap-4 text-sm text-zinc-500">
          <div><span className="block font-semibold text-zinc-700 dark:text-zinc-300">CVV</span> 123 (or 1234 for Amex)</div>
          <div><span className="block font-semibold text-zinc-700 dark:text-zinc-300">Expiry</span> Any future date</div>
          <div><span className="block font-semibold text-zinc-700 dark:text-zinc-300">Zip</span> Any 5 digits</div>
        </div>
      </div>
    </div>
  );
}
