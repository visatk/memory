import { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { Copy, Check, Sparkles, MapPin, UserSquare2, Phone, Hash } from 'lucide-react';

const FIRST_NAMES = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
const STREETS = ['Maple Ave', 'Oak St', 'Washington Blvd', 'Lakeview Dr', 'Cedar Ln', 'Pine Ct', 'Elm St'];
const CITIES = ['Springfield', 'Riverside', 'Franklin', 'Greenville', 'Bristol', 'Fairview', 'Salem'];
const STATES = ['CA', 'TX', 'NY', 'FL', 'IL', 'WA', 'CO'];

type Identity = {
  fullName: string;
  phone: string;
  ssn: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

export default function FakeAddress() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const { copiedText, copy } = useCopyToClipboard();

  const generateIdentity = () => {
    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const ph = `(${Math.floor(Math.random() * 800) + 200}) ${Math.floor(Math.random() * 800) + 200}-${Math.floor(Math.random() * 8999) + 1000}`;
    const ssnMask = `XXX-XX-${Math.floor(Math.random() * 8999) + 1000}`;
    
    setIdentity({
      fullName: `${fn} ${ln}`,
      phone: ph,
      ssn: ssnMask,
      street: `${Math.floor(Math.random() * 9999) + 1} ${STREETS[Math.floor(Math.random() * STREETS.length)]}`,
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      state: STATES[Math.floor(Math.random() * STATES.length)],
      zip: Math.floor(Math.random() * 89999 + 10000).toString(),
    });
  };

  const formattedOutput = identity ? 
    `${identity.fullName}\n${identity.street}\n${identity.city}, ${identity.state} ${identity.zip}\nPhone: ${identity.phone}\nSSN (Last 4): ${identity.ssn}` : '';

  return (
    <div className="max-w-4xl mx-auto md:py-8 animation-fade-in">
      <SeoHead 
        title="Mock Identity & Address Generator" 
        description="Generate realistic full identities including addresses, phone numbers, and secure SSN masks for software testing." 
        isTool={true}
      />
      
      <div className="mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[11px] font-bold uppercase tracking-widest mb-4">
          <UserSquare2 className="size-3.5 fill-current" /> Identity Engine
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Mock Identity Generator</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Instantly generate structurally valid identity vectors for form testing and QA.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/20 dark:shadow-black/20 p-6 md:p-10">
        
        {identity ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-1"><UserSquare2 className="size-3.5" /> Full Name</label>
                <div className="text-lg font-medium text-zinc-900 dark:text-white">{identity.fullName}</div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-1"><Phone className="size-3.5" /> Phone Number</label>
                <div className="text-lg font-medium text-zinc-900 dark:text-white font-mono">{identity.phone}</div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-1"><Hash className="size-3.5" /> Partial SSN</label>
                <div className="text-lg font-medium text-zinc-900 dark:text-white font-mono">{identity.ssn}</div>
              </div>
            </div>
            <div className="space-y-4 md:border-l border-zinc-200 dark:border-zinc-800 md:pl-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-1"><MapPin className="size-3.5" /> Street Address</label>
                <div className="text-lg font-medium text-zinc-900 dark:text-white">{identity.street}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">City & State</label>
                <div className="text-lg font-medium text-zinc-900 dark:text-white">{identity.city}, {identity.state}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">ZIP Code</label>
                <div className="text-lg font-medium text-zinc-900 dark:text-white font-mono">{identity.zip}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl border border-zinc-100 dark:border-zinc-800 border-dashed mb-8">
            <UserSquare2 className="size-16 text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium">Click generate to create a new identity vector.</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={generateIdentity}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-base font-bold rounded-2xl hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="size-5" />
            Generate Vector
          </button>
          <button 
            onClick={() => copy(formattedOutput)}
            disabled={!identity}
            className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${
              copiedText 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
            }`}
          >
            {copiedText ? <Check className="size-5" /> : <Copy className="size-5" />}
            {copiedText ? 'Copied Data' : 'Copy All'}
          </button>
        </div>
      </div>
    </div>
  );
}
