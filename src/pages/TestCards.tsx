import { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { Copy, Check, Sparkles } from 'lucide-react';

const CARD_NETWORKS = {
  visa: { name: 'Visa', prefix: '4242', length: 16 },
  mastercard: { name: 'Mastercard', prefix: '5555', length: 16 },
  amex: { name: 'Amex', prefix: '3782', length: 15 },
  discover: { name: 'Discover', prefix: '6011', length: 16 }
};

export default function TestCards() {
  const [network, setNetwork] = useState<keyof typeof CARD_NETWORKS>('visa');
  const [generatedCard, setGeneratedCard] = useState('');
  const { copiedText, copy } = useCopyToClipboard();

  const generateCard = () => {
    const config = CARD_NETWORKS[network];
    let number = config.prefix;
    while (number.length < config.length - 1) {
      number += Math.floor(Math.random() * 10).toString();
    }
    
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
    
    const formatted = finalCard.match(new RegExp(`.{1,4}`, 'g'))?.join(' ') || finalCard;
    setGeneratedCard(formatted);
  };

  return (
    <div className="max-w-4xl mx-auto md:py-8 animation-fade-in">
      <SeoHead 
        title="Test Credit Card Generator" 
        description="Generate valid dummy credit card numbers for Stripe, Braintree, and QA testing. Instant, client-side, and secure." 
      />
      
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Test Card Generator</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Instantly generate valid dummy payment cards for gateway testing.</p>
      </div>

      <div className="p-4 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
        {/* Network Selection - Improved Mobile Scrolling */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {Object.entries(CARD_NETWORKS).map(([key, data]) => (
            <button
              key={key}
              onClick={() => {
                setNetwork(key as keyof typeof CARD_NETWORKS);
                setGeneratedCard(''); // Reset on network switch
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex-1 md:flex-none text-center border ${
                network === key 
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-md' 
                  : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800'
              }`}
            >
              {data.name}
            </button>
          ))}
        </div>

        {/* Input and Actions Group */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-1 relative group">
            <input 
              type="text" 
              readOnly 
              value={generatedCard}
              placeholder={`Click generate for ${CARD_NETWORKS[network].name}...`}
              className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-5 pr-12 py-5 font-mono text-xl text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
            {generatedCard && (
               <button 
                onClick={() => copy(generatedCard.replace(/\s/g, ''))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
                title="Copy without spaces"
               >
                 {copiedText ? <Check className="size-5 text-emerald-500" /> : <Copy className="size-5" />}
               </button>
            )}
          </div>
          
          <button 
            onClick={generateCard}
            className="flex items-center justify-center gap-2 px-8 py-5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="size-5" />
            Generate
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 grid grid-cols-3 gap-4 text-center md:text-left text-sm">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
            <span className="block font-bold text-zinc-400 mb-1 uppercase text-xs tracking-wider">CVV</span> 
            <span className="font-mono text-zinc-900 dark:text-zinc-100">{network === 'amex' ? '1234' : '123'}</span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
            <span className="block font-bold text-zinc-400 mb-1 uppercase text-xs tracking-wider">Expiry</span> 
            <span className="font-medium text-zinc-900 dark:text-zinc-100">Any Future</span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
            <span className="block font-bold text-zinc-400 mb-1 uppercase text-xs tracking-wider">Zip</span> 
            <span className="font-mono text-zinc-900 dark:text-zinc-100">90210</span>
          </div>
        </div>
      </div>
    </div>
  );
}
