import { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { Copy, Check, Sparkles, MapPin } from 'lucide-react';

const STREETS = ['Maple Ave', 'Oak St', 'Washington Blvd', 'Lakeview Dr', 'Cedar Ln', 'Pine Ct', 'Elm St'];
const CITIES = ['Springfield', 'Riverside', 'Franklin', 'Greenville', 'Bristol', 'Fairview', 'Salem'];
const STATES = ['CA', 'TX', 'NY', 'FL', 'IL', 'WA', 'CO'];

export default function FakeAddress() {
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const { copiedText, copy } = useCopyToClipboard();

  const generateAddress = () => {
    setAddress({
      street: `${Math.floor(Math.random() * 9999) + 1} ${STREETS[Math.floor(Math.random() * STREETS.length)]}`,
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      state: STATES[Math.floor(Math.random() * STATES.length)],
      zip: Math.floor(Math.random() * 89999 + 10000).toString(),
    });
  };

  const formattedAddress = address.street ? `${address.street}\n${address.city}, ${address.state} ${address.zip}` : '';

  return (
    <div className="max-w-4xl mx-auto md:py-8 animation-fade-in">
      <SeoHead 
        title="Fake Address Generator" 
        description="Generate random, realistic US addresses for form testing and QA. Fast, secure, and privacy-friendly." 
      />
      
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Random Address Generator</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Instantly generate realistic addresses for software testing.</p>
      </div>

      <div className="p-4 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
        
        <div className="flex flex-col md:flex-row gap-4 items-stretch mb-6">
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-5 text-zinc-400">
              <MapPin className="size-6" />
            </div>
            <textarea 
              readOnly 
              rows={3}
              value={formattedAddress}
              placeholder="Click generate to create a random address..."
              className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-14 pr-12 py-5 font-mono text-lg md:text-xl text-zinc-900 dark:text-zinc-100 outline-none resize-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
            {formattedAddress && (
              <button 
                onClick={() => copy(formattedAddress)}
                className="absolute right-3 top-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
                title="Copy Address"
              >
                {copiedText ? <Check className="size-6 text-emerald-500" /> : <Copy className="size-6" />}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={generateAddress}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="size-5" />
            Generate Address
          </button>
          <button 
            onClick={() => copy(formattedAddress)}
            disabled={!address.street}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98] ${
              copiedText 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'
            }`}
          >
            {copiedText ? <Check className="size-5" /> : <Copy className="size-5" />}
            {copiedText ? 'Copied Data!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
