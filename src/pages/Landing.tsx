import { NavLink } from 'react-router-dom';
import { CreditCard, MapPin, Terminal, Zap } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animation-fade-in relative z-10">
      <SeoHead 
        title="Edge Developer Tools" 
        description="High-performance, zero-latency developer tools running directly on the Cloudflare Edge. Fake data generation, cards, and more." 
      />
      
      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest mb-8">
        <Zap className="size-3.5 fill-current" />
        Running on the Edge
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
        <div className="relative inline-flex items-center justify-center p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-orange-500/10">
          <Terminal className="size-10 text-orange-500" />
        </div>
      </div>
      
      <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-balance text-zinc-900 dark:text-white">
        Developer Tools, <br className="hidden md:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">
          Zero Latency.
        </span>
      </h2>
      
      <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mb-12 text-balance leading-relaxed">
        Free, browser-native primitives built for engineers. No tracking, no auth walls, no server-side data hoarding. Instantly generate the payload you need.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <NavLink to="/test-cards" className="group flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-2xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-zinc-900/20 dark:shadow-zinc-100/10">
          <CreditCard className="size-5 group-hover:text-orange-400 transition-colors" />
          Card Generator
        </NavLink>
        <NavLink to="/fake-address" className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-zinc-900 dark:bg-[#0a0a0a] dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700">
          <MapPin className="size-5 text-zinc-400 group-hover:text-orange-500 transition-colors" />
          Address Generator
        </NavLink>
      </div>
    </div>
  );
}
