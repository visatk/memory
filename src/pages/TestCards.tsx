import { useState, useMemo } from 'react';
import { SeoHead } from '../components/SeoHead';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { Copy, Check, Sparkles, Database, ShieldAlert, Code2, FileJson, FileText, CreditCard, Network, AlertCircle } from 'lucide-react';

const PRESET_BINS = [
  { name: 'Stripe Visa', bin: '424242' },
  { name: 'Stripe MC', bin: '555555' },
  { name: 'Braintree Amex', bin: '378282' },
  { name: 'Discover Test', bin: '601100' },
  { name: 'JCB QA', bin: '352800' }
];

type CardData = {
  network?: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  formattedString?: string;
};

type ExportFormat = 'pipe' | 'json' | 'csv';

export default function TestCards() {
  const [bin, setBin] = useState('424242');
  const [quantity, setQuantity] = useState<number>(10);
  const [generatedCards, setGeneratedCards] = useState<CardData[]>([]);
  const [metadata, setMetadata] = useState<{ networkDetected: string, vectorLength: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [format, setFormat] = useState<ExportFormat>('pipe');
  
  const { copiedText, copy } = useCopyToClipboard();

  const detectedNetwork = useMemo(() => {
    if (bin.startsWith('34') || bin.startsWith('37')) return 'American Express';
    if (bin.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(bin) || /^2[2-7]/.test(bin)) return 'Mastercard';
    if (bin.startsWith('6')) return 'Discover';
    if (bin.startsWith('35')) return 'JCB';
    if (/^3(?:0[0-5]|[68])/.test(bin)) return 'Diners Club';
    return bin.length > 0 ? 'Custom Network' : 'Awaiting BIN...';
  }, [bin]);

  const handleGenerate = async () => {
    if (!bin.trim()) {
      setError('Please provide a valid BIN.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/tools/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bin, quantity })
      });
      
      const data = await res.json() as { success?: boolean, cards?: CardData[], metadata?: any, error?: string };
      
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to execute payload generation.');
      
      if (data.cards) {
        setGeneratedCards(data.cards);
        if (data.metadata) setMetadata(data.metadata);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedOutput = useMemo(() => {
    if (!generatedCards.length) return '';
    
    if (format === 'pipe') {
      return generatedCards.map(card => {
        return card.formattedString || `${card.number}|${card.expMonth}|${card.expYear}|${card.cvv}`;
      }).join('\n');
    }
    
    if (format === 'csv') {
      const header = 'Network,CardNumber,ExpMonth,ExpYear,CVV\n';
      const rows = generatedCards.map(card => {
        return `${card.network || 'Unknown'},${card.number},${card.expMonth},${card.expYear},${card.cvv}`;
      }).join('\n');
      return header + rows;
    }
    
    if (format === 'json') {
      const objects = generatedCards.map(card => {
        // Remove internal formattedString for clean JSON export
        const { formattedString, ...rest } = card;
        return rest;
      });
      return JSON.stringify(objects, null, 2);
    }
    
    return '';
  }, [generatedCards, format]);

  return (
    <div className="max-w-5xl mx-auto md:py-8 animation-fade-in">
      <SeoHead 
        title="Enterprise BIN Generator | QA Payload Tool" 
        description="Generate 100% structurally valid, Luhn-compliant credit card payloads. Output clean testing data for Visa, Mastercard, Amex, and Discover." 
        isTool={true}
      />
      
      <div className="mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[11px] font-bold uppercase tracking-widest mb-4 shadow-sm">
          <Database className="size-3.5 fill-current" /> Structurally Valid QA Payload
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Enterprise Card Generator</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Instantly synthesize mathematically valid dummy payment vectors utilizing precise network length constraints and cryptographic Luhn checks.</p>
        
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 inline-flex px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-500/20">
          <AlertCircle className="size-4" /> Strictly for local development and sandbox environments. Data holds no financial validity.
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/20 dark:shadow-black/20 overflow-hidden">
        
        <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0a0a0a]/50">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2">Gateway Presets</span>
            {PRESET_BINS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setBin(preset.bin)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-orange-500 hover:text-orange-500 hover:shadow-sm cursor-pointer shadow-sm"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5">
              <label className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                <span>Target BIN Prefix</span>
                <span className="text-orange-500 flex items-center gap-1"><Network className="size-3" /> {detectedNetwork}</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                <input 
                  type="text" 
                  value={bin}
                  onChange={(e) => setBin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 1 to 16 digits..."
                  maxLength={16}
                  className="w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 font-mono text-lg font-medium outline-none focus:ring-2 focus:ring-orange-500/50 transition-all shadow-sm"
                />
              </div>
            </div>
            
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Volume Size</label>
              <select 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-4 text-base font-semibold outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer shadow-sm appearance-none"
              >
                <option value={1}>1 Vector</option>
                <option value={10}>10 Vectors</option>
                <option value={50}>50 Vectors</option>
                <option value={100}>100 Vectors</option>
                <option value={500}>500 Vectors (Bulk)</option>
              </select>
            </div>
            
            <div className="md:col-span-3 pt-6">
              <button 
                onClick={handleGenerate}
                disabled={isLoading || bin.length < 1}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 hover:bg-orange-500 text-white dark:bg-zinc-100 dark:hover:bg-orange-500 dark:text-zinc-900 dark:hover:text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="size-5" />
                {isLoading ? 'Synthesizing...' : 'Execute'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-5 flex items-center gap-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-200 dark:border-red-500/20 font-medium">
              <ShieldAlert className="size-5 shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Code2 className="size-5 text-orange-500" /> Generated Payload
              </h3>
              {metadata && (
                <span className="hidden md:flex px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider rounded-md border border-zinc-200 dark:border-zinc-700">
                  {metadata.networkDetected} • {metadata.vectorLength} DIGITS
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-zinc-100 dark:bg-[#0a0a0a] p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <button onClick={() => setFormat('pipe')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${format === 'pipe' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer'}`}>
                   Raw
                </button>
                <button onClick={() => setFormat('json')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${format === 'json' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer'}`}>
                  <FileJson className="size-3.5" /> JSON
                </button>
                <button onClick={() => setFormat('csv')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${format === 'csv' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer'}`}>
                  <FileText className="size-3.5" /> CSV
                </button>
              </div>

              <button 
                onClick={() => copy(formattedOutput)}
                disabled={generatedCards.length === 0}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  copiedText 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 border border-orange-500'
                }`}
              >
                {copiedText ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copiedText ? 'Copied' : 'Copy Payload'}
              </button>
            </div>
          </div>
          
          <div className="relative group">
            <textarea 
              readOnly 
              rows={Math.max(12, Math.min(25, generatedCards.length || 12))}
              value={formattedOutput}
              placeholder="Awaiting execution... Output will render here."
              className={`w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-5 font-mono text-sm leading-relaxed text-zinc-800 dark:text-zinc-300 outline-none resize-y custom-scrollbar placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-orange-500/50 transition-colors ${format === 'json' ? 'whitespace-pre' : ''}`}
            />
            {generatedCards.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                 <Database className="size-16 mb-4 text-zinc-400" />
                 <span className="text-sm font-semibold text-zinc-500">System Standing By...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
