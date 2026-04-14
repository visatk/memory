import { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

// In a massive production app, this could be fetched from the /api route to keep the bundle small.
// For instant UX, a localized subset works perfectly.
const STREETS = ['Maple Ave', 'Oak St', 'Washington Blvd', 'Lakeview Dr', 'Cedar Ln'];
const CITIES = ['Springfield', 'Riverside', 'Franklin', 'Greenville', 'Bristol'];
const STATES = ['CA', 'TX', 'NY', 'FL', 'IL'];

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
    <div className="max-w-3xl mx-auto py-8">
      <SeoHead 
        title="Fake Address Generator" 
        description="Generate random, realistic US addresses for form testing and QA. Fast, secure, and privacy-friendly." 
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Random Address Generator</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Instantly generate realistic addresses for software testing.</p>
      </div>

      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="relative mb-4">
          <textarea 
            readOnly 
            rows={3}
            value={formattedAddress}
            placeholder="Click generate to create a random address..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4 font-mono text-zinc-900 dark:text-zinc-100 outline-none resize-none focus:ring-2 focus:ring-orange-500/50 transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={generateAddress}
            className="px-6 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Generate Address
          </button>
          <button 
            onClick={() => copy(formattedAddress)}
            disabled={!address.street}
            className={`px-6 py-3 font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              copiedText 
                ? 'bg-emerald-500 text-white' 
                : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'
            }`}
          >
            {copiedText ? 'Copied Data!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
