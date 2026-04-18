import { useState, useRef, useEffect } from 'react';
import { SeoHead } from '../components/SeoHead';
import { Play, Square, CheckCircle2, XCircle, HelpCircle, ShieldCheck, CreditCard, Activity, Trash2 } from 'lucide-react';

type CheckStatus = 'Idle' | 'Live' | 'Die' | 'Unknown';

interface CheckedCard {
  raw: string;
  status: CheckStatus;
  message: string;
  time: number;
}

export default function CardChecker() {
  const [input, setInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CheckedCard[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStart = async () => {
    const cards = input.split('\n').map(c => c.trim()).filter(c => c.length > 0);
    if (cards.length === 0) return;

    setIsChecking(true);
    setProgress({ current: 0, total: cards.length });
    setResults([]);
    
    abortControllerRef.current = new AbortController();

    for (let i = 0; i < cards.length; i++) {
      if (abortControllerRef.current?.signal.aborted) break;
      
      setProgress(p => ({ ...p, current: i + 1 }));
      const startTime = Date.now();
      
      try {
        const res = await fetch('/api/tools/check-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardPayload: cards[i] }),
          signal: abortControllerRef.current.signal
        });
        
        const data = await res.json() as { status: CheckStatus; message: string; };
        
        setResults(prev => [{
          raw: cards[i],
          status: data.status,
          message: data.message,
          time: Date.now() - startTime
        }, ...prev]);
        
      } catch (err: any) {
        if (err.name === 'AbortError') break;
        setResults(prev => [{
          raw: cards[i],
          status: 'Unknown',
          message: 'Network execution failed',
          time: Date.now() - startTime
        }, ...prev]);
      }

      // CLIENT-SIDE THROTTLING: Wait between 1.2s and 2s before the next request
      // This prevents the frontend from slamming the upstream API and triggering a 429 Error
      if (i < cards.length - 1 && !abortControllerRef.current?.signal.aborted) {
        const jitterDelay = Math.floor(Math.random() * 800) + 1200;
        await new Promise(resolve => setTimeout(resolve, jitterDelay));
      }
    }

    setIsChecking(false);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsChecking(false);
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const stats = {
    live: results.filter(r => r.status === 'Live').length,
    die: results.filter(r => r.status === 'Die').length,
    unknown: results.filter(r => r.status === 'Unknown').length,
  };

  const percentComplete = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto md:py-8 animation-fade-in">
      <SeoHead 
        title="MockVerify | Payload Checker" 
        description="Verify and validate mock payment vectors in a simulated gateway environment." 
        isTool={true}
      />
      
      <div className="mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[11px] font-bold uppercase tracking-widest mb-4 shadow-sm">
          <ShieldCheck className="size-3.5 fill-current" /> Live Verification Pipeline
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Payload Verify Engine</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Process and analyze test payloads through live upstream networks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/20 dark:shadow-black/20 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0a0a0a]/50 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <CreditCard className="size-4" /> Input Vectors
              </label>
              <button 
                onClick={() => setInput('')} 
                disabled={isChecking || !input}
                className="text-zinc-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                title="Clear input"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isChecking}
              placeholder="Format: 53012724539xxxxx|05|2026|653&#10;One vector per line..."
              className="flex-1 w-full bg-transparent p-6 font-mono text-sm leading-relaxed outline-none resize-none custom-scrollbar placeholder:text-zinc-400 dark:placeholder:text-zinc-600 disabled:opacity-50"
            />
            
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0a0a0a]/50 flex gap-3">
              {!isChecking ? (
                <button 
                  onClick={handleStart}
                  disabled={!input.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-orange-500 text-white dark:bg-zinc-100 dark:hover:bg-orange-500 dark:text-zinc-900 dark:hover:text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-md active:scale-[0.98] cursor-pointer"
                >
                  <Play className="size-4" /> Start Verifier
                </button>
              ) : (
                <button 
                  onClick={handleStop}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer shadow-red-500/20"
                >
                  <Square className="size-4 fill-current" /> Stop Process
                </button>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          {progress.total > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="size-4" /> Execution Progress
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

        {/* Right Column: Statistics & Output */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 mb-2" />
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none mb-1">{stats.live}</span>
              <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest">Live</span>
            </div>
            
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
              <XCircle className="size-6 text-red-600 dark:text-red-400 mb-2" />
              <span className="text-2xl font-black text-red-700 dark:text-red-400 leading-none mb-1">{stats.die}</span>
              <span className="text-[10px] font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-widest">Die</span>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
              <HelpCircle className="size-6 text-amber-600 dark:text-amber-400 mb-2" />
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400 leading-none mb-1">{stats.unknown}</span>
              <span className="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/70 uppercase tracking-widest">Unknown / 429</span>
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#0a0a0a]/50">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Verification Log</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-zinc-50 dark:bg-[#0a0a0a]">
              {results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <Activity className="size-12 mb-3 text-zinc-400" />
                  <span className="text-sm font-semibold text-zinc-500">Awaiting Payload Execution...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((res, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border text-sm font-mono transition-colors ${
                        res.status === 'Live' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                        res.status === 'Die' ? 'bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400' :
                        'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      <div className="truncate mb-2 sm:mb-0 mr-4 font-medium select-all">
                        {res.raw}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs opacity-70">[{res.time}ms]</span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          res.status === 'Live' ? 'bg-emerald-500/20' :
                          res.status === 'Die' ? 'bg-red-500/20' :
                          'bg-amber-500/20'
                        }`}>
                          {res.message}
                        </span>
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
