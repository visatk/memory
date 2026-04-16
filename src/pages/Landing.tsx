import { NavLink } from 'react-router-dom';
import { CreditCard, MapPin, Terminal, Zap, Shield, Globe, Cpu, Database, ChevronRight, Layers } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen animation-fade-in relative z-10 pb-20">
      <SeoHead 
        title="DevKit Pro | Edge-Native Developer Tools" 
        description="High-performance, zero-latency developer tools running directly on the Cloudflare Edge. Instantly generate test cards, mock identities, and secure data payloads." 
        canonical="https://www.visatk.us/"
      />
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-20 pb-24 text-center px-4 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-orange-500/10 via-amber-500/5 to-transparent blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
          <Zap className="size-3.5 fill-current" />
          Powered by Cloudflare Workers
        </div>

        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-3xl transition-all duration-500 group-hover:bg-orange-500/30 group-hover:blur-3xl"></div>
          <div className="relative inline-flex items-center justify-center p-5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl shadow-orange-500/10 transition-transform duration-500 group-hover:scale-105">
            <Terminal className="size-12 text-orange-500" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-balance text-zinc-900 dark:text-white leading-[1.1]">
          Developer Primitives, <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">
            Zero Latency.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mb-10 text-balance leading-relaxed">
          Browser-native utilities built strictly for engineers. No tracking, no auth walls for core tools, no server-side data hoarding. Generate the payload required, instantly at the edge.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <NavLink to="/test-cards" className="group flex items-center justify-center gap-3 px-8 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-2xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-zinc-900/20 dark:shadow-zinc-100/10">
            <CreditCard className="size-5 group-hover:text-orange-400 dark:group-hover:text-orange-600 transition-colors" />
            <span>Generate Test Cards</span>
            <ChevronRight className="size-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </NavLink>
          <NavLink to="/fake-address" className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-zinc-900 dark:bg-[#0a0a0a] dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700">
            <MapPin className="size-5 text-zinc-400 group-hover:text-orange-500 transition-colors" />
            <span>Mock Addresses</span>
          </NavLink>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="py-16 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-white">Enterprise-Grade Infrastructure</h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">Engineered for high-availability and immediate execution using modern web APIs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
          {[
            { icon: Globe, title: "Edge Distributed", desc: "Requests are routed to the nearest data center globally, ensuring sub-50ms response times for all utility endpoints." },
            { icon: Shield, title: "Privacy First", desc: "Generators utilize client-side entropy and stateless Edge computing. No generated mock data is ever persisted." },
            { icon: Database, title: "D1 Backed Forum", desc: "Community discussions are powered by globally distributed SQLite databases for robust, transactional integrity." },
            { icon: Layers, title: "Modular Architecture", desc: "Built on a flexible Vite and React foundation, allowing seamless integration of new cryptographic and data tools." },
            { icon: Cpu, title: "Wasm Optimized", desc: "Compute-heavy cryptographic operations leverage WebAssembly modules running directly within the V8 isolate." },
            { icon: Zap, title: "Modern Stack", desc: "Utilizing Tailwind CSS v4, TypeScript, and Hono for a strictly typed, highly performant development experience." }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-orange-500/30 transition-colors group">
              <div className="size-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all">
                <feature.icon className="size-6 text-zinc-600 dark:text-zinc-400 group-hover:text-orange-500 transition-colors" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
