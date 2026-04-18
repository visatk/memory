import { useState, useRef, useEffect } from 'react';
import { SeoHead } from '../components/SeoHead';
import { Play, Square, CheckCircle2, XCircle, CreditCard, Activity, Trash2, Search, Database } from 'lucide-react';

type CheckStatus = 'Found' | 'Not Found' | 'Error';

interface CheckedBin {
  raw: string;
  status: CheckStatus;
  brand?: string;
  country?: string;
  funding?: string;
  length?: number;
  time: number;
}

export default function BinChecker() {
  const [input, setInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CheckedBin[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStart = async () => {
    // Extract first 6 digits of each line to process as BINs
    const lines = input.split('\n').map(c => c.trim()).filter(c => c.length >= 6);
    const bins = lines.map(line => line.replace(/\D/g, '').substring(0, 6)).filter(b => b.length === 6);
    
    if (bins.length === 0) return;

    setIsChecking(true);
    setProgress({ current: 0, total: bins.length });
    setResults([]);
    
    abortControllerRef.current = new AbortController();

    for (let i = 0; i < bins.length; i++) {
      if (abortControllerRef.current?.signal.aborted) break;
      
      setProgress(p => ({ ...p, current: i + 1 }));
      const startTime = Date.now();
      
      try {
        const res = await fetch('/api/tools/check-bin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bin: bins[i] }),
          signal: abortControllerRef.current.signal
        });
        
        const data = await res.json() as any;
        
        if (data.success) {
          setResults(prev => [{
            raw: bins[i],
            status: 'Found',
            brand: data.metadata.brand,
            country: data.metadata.country,
            funding: data.metadata.funding,
            length: data.metadata.pan_length,
            time: Date.now() - startTime
          }, ...prev]);
        } else {
          setResults(prev => [{
            raw: bins[i],
            status: 'Not Found',
            time: Date.now() - startTime
          }, ...prev]);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') break;
        setResults(prev => [{
          raw: bins[i],
          status: 'Error',
          time: Date.now() - startTime
        }, ...prev]);
      }
    }

    setIsChecking(false);
  };

  const handleStop = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setIsChecking(false);
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const stats = {
    found: results.filter(r => r.status === 'Found').length,
    notFound: results.filter(r => r.status === 'Not Found').length,
    errors: results.filter(r => r.status === 'Error').length,
  };

  const percentComplete = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto md:py-8 animation-fade-in">
      <SeoHead 
        title="BIN Lookup | Metadata Verification" 
        description="Verify Bank Identification Numbers (BINs) in real-time." 
        isTool={true}
      />
      
      <div className="mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[11px] font-bold uppercase tracking-widest mb-4 shadow-sm">
          <Database className="size-3.5 fill-current" /> Metadata API Integration
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">BIN Lookup Engine</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Query issuer networks to identify card brand, funding source, and geographic origin in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/20 dark:shadow-black/20 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0a0a0a]/50 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <CreditCard className="size-4" /> BIN List
              </label>
              <button 
                onClick={() => setInput('')} 
                disabled={isChecking || !input}
                className="text-zinc-400 hover:text-red-500 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isChecking}
              placeholder="Format: 415464&#10;Or paste full cards, we will extract the first 6 digits automatically."
              className="flex-1 w-full bg-transparent p-6 font-mono text-sm leading-relaxed outline-none resize-none custom-scrollbar placeholder:text-zinc-400 dark:placeholder:text-zinc-600 disabled:opacity-50"
            />
            
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0a0a0a]/50 flex gap-3">
              {!isChecking ? (
                <button 
                  onClick={handleStart}
                  disabled={!input.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-orange-500 text-white dark:bg-zinc-100 dark:hover:bg-orange-500 dark:text-zinc-900 dark:hover:text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-md active:scale-[0.98] cursor-pointer"
                >
                  <Search className="size-4" /> Start Lookup
                </button>
              ) : (
                <button 
                  onClick={handleStop}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer shadow-red-500/20"
                >
                  <Square className="size-4 fill-current" /> Stop
                </button>
              )}
            </div>
          </div>

          {progress.total > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="size-4" /> Queue Progress
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{progress.current} / {progress.total}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 ease-out"
                  style={{ width: `${percentComplete}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Output Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none mb-1">{stats.found}</span>
              <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest">Found</span>
            </div>
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400 leading-none mb-1">{stats.notFound}</span>
              <span className="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/70 uppercase tracking-widest">Missing</span>
            </div>
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-red-700 dark:text-red-400 leading-none mb-1">{stats.errors}</span>
              <span className="text-[10px] font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-widest">Errors</span>
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0a0a0a]/50">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Metadata Output</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-zinc-50 dark:bg-[#0a0a0a]">
              {results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <Database className="size-12 mb-3 text-zinc-400" />
                  <span className="text-sm font-semibold text-zinc-500">Awaiting Queries...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((res, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border text-sm transition-colors ${
                        res.status === 'Found' ? 'bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700' :
                        res.status === 'Not Found' ? 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400' :
                        'bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400'
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-2 sm:mb-0">
                        <span className="font-mono font-bold text-base bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-lg select-all">
                          {res.raw}
                        </span>
                        {res.status === 'Found' && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-zinc-200 dark:border-zinc-700">
                              {res.brand}
                            </span>
                            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-500/20">
                              {res.funding}
                            </span>
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-500/20">
                              {res.country}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs opacity-50 font-mono">[{res.time}ms]</span>
                        {res.status !== 'Found' && (
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            res.status === 'Not Found' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-red-500/20 text-red-700 dark:text-red-400'
                          }`}>
                            {res.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
