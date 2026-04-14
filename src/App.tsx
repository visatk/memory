import { useEffect, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router';

// Types for our new API response
interface SystemMetrics {
  status: string;
  nodeCryptoHash: string;
  cache: {
    status: 'HIT' | 'MISS';
    timestamp: string;
  };
  systemTime: string;
}

function EdgeDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    fetch('/api/system-metrics')
      .then(res => res.json())
      .then(setMetrics)
      .catch(console.error);
  }, [refreshCount]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Edge Telemetry</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Powered by Node.js Compat & Cloudflare Runtime APIs
            </p>
          </div>
          <button 
            onClick={() => setRefreshCount(c => c + 1)}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Refresh Data
          </button>
        </div>
        
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cache Metrics */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Edge Cache API</h3>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-1 text-xs font-bold rounded-md ${metrics.cache.status === 'HIT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'}`}>
                  {metrics.cache.status}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">30s TTL</span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-4 truncate">
                Stored: {new Date(metrics.cache.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {/* Node.js Compatibility */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">node:crypto + buffer</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                Native SHA-256 generation running directly in the V8 isolate.
              </p>
              <div className="p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg">
                <code className="text-xs text-blue-600 dark:text-blue-400 break-all">
                  {metrics.nodeCryptoHash}
                </code>
              </div>
            </div>

            {/* Background Tasks */}
            <div className="md:col-span-2 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">ctx.waitUntil()</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Non-blocking background tasks are executed independently of the main thread. Check your Wrangler console to see the delayed log output without delaying this UI response.
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full"></div>
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
          <div className="size-6 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-lg shadow-sm"></div>
          ProKit Edge
        </div>
        <nav className="flex gap-6 text-sm font-medium">
          <NavLink to="/" className="text-zinc-900 dark:text-zinc-100 hover:text-blue-500 transition-colors">
            Telemetry
          </NavLink>
        </nav>
      </header>
      
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<EdgeDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
