import { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { Copy, Check, Sparkles, Database, ShieldAlert } from 'lucide-react';

const PRESET_BINS = [
  { name: 'Visa', bin: '424242' },
  { name: 'Mastercard', bin: '555555' },
  { name: 'Amex', bin: '378282' },
  { name: 'Discover', bin: '601100' }
];

export default function TestCards() {
  const [bin, setBin] = useState('424242');
  const [quantity, setQuantity] = useState<number>(10);
  const [generatedCards, setGeneratedCards] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { copiedText, copy } = useCopyToClipboard();

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/tools/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bin, quantity })
      });
      
      const data = await res.json() as { cards?: string[], error?: string, success?: boolean };
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate cards');
      if (data.cards) setGeneratedCards(data.cards);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedOutput = generatedCards.join('\n');

  return (
    <div className="max-w-4xl mx-auto md:py-8 animation-fade-in">
      <SeoHead 
        title="BIN Card Generator API" 
        description="Generate bulk test credit card numbers from a custom BIN. Includes expiry and CVV formatted for QA database injection." 
        isTool={true}
      />
      
      <div className="mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Database className="size-3.5" /> Bulk Generator Tool
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">QA Card Generator</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Generate valid Luhn-compliant dummy payment data from custom BINs for system testing.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Configuration Panel */}
        <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0a0a0a]/50">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm font-semibold text-zinc-500 mr-2">Quick Fill:</span>
            {PRESET_BINS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setBin(preset.bin)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-orange-500 hover:text-orange-500 cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Target BIN (6-16 digits)</label>
              <input 
                type="text" 
                value={bin}
                onChange={(e) => setBin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 424242"
                maxLength={16}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 font-mono text-lg outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Quantity</label>
              <select 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 font-medium outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer"
              >
                <option value={1}>1 Card</option>
                <option value={10}>10 Cards</option>
                <option value={20}>20 Cards</option>
                <option value={50}>50 Cards</option>
                <option value={100}>100 Cards</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <button 
                onClick={handleGenerate}
                disabled={isLoading || bin.length < 6}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="size-4" />
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <ShieldAlert className="size-4" /> {error}
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Generated Payload</h3>
            {generatedCards.length > 0 && (
              <button 
                onClick={() => copy(formattedOutput)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  copiedText 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {copiedText ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copiedText ? 'Copied to Clipboard' : 'Copy All'}
              </button>
            )}
          </div>
          
          <div className="relative">
            <textarea 
              readOnly 
              rows={Math.max(10, Math.min(25, generatedCards.length || 10))}
              value={formattedOutput}
              placeholder="Output format: CardNumber|MM|YYYY|CVV"
              className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 font-mono text-sm md:text-base text-zinc-900 dark:text-zinc-100 outline-none resize-y custom-scrollbar placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
            {generatedCards.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                 <Database className="size-24" />
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
