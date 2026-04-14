import { NavLink } from 'react-router-dom';
import { CreditCard, MapPin, Terminal } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animation-fade-in">
      <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 rounded-2xl mb-6">
        <Terminal className="size-8 text-orange-500" />
      </div>
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
        Developer Tools, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Zero Latency.</span>
      </h2>
      <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mb-10 text-balance leading-relaxed">
        Free, browser-native tools built for developers. No tracking, no logins, no server-side data hoarding. Instantly generate the data you need.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <NavLink to="/test-cards" className="flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/10">
          <CreditCard className="size-5" />
          Card Generator
        </NavLink>
        <NavLink to="/fake-address" className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm">
          <MapPin className="size-5" />
          Address Generator
        </NavLink>
      </div>
    </div>
  );
}
