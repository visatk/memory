import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Hexagon, Component } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 animate-in fade-in duration-500">
      <section className="text-center pt-16 pb-12 space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Next-Gen <span className="text-cf-orange">Edge Infrastructure</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500">
          Tailwind v4, Vite, and Hono running entirely on Cloudflare's V8 isolates. 
          Unmatched developer experience with native Workerd integration.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            to="/telemetry"
            className="rounded-full bg-cf-orange px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-all"
          >
            Inspect Edge Nodes
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-2xl border border-gray-100 shadow-sm">
          <Zap className="h-8 w-8 text-cf-orange mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Tailwind v4 Native</h3>
          <p className="text-gray-500 leading-relaxed text-sm">
            Powered by Lightning CSS via `@tailwindcss/vite`. Zero config files, instant compilation, utilizing native CSS standard variables.
          </p>
        </div>
        <div className="glass-panel p-8 rounded-2xl border border-gray-100 shadow-sm">
          <Hexagon className="h-8 w-8 text-cf-orange mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Workerd Environment</h3>
          <p className="text-gray-500 leading-relaxed text-sm">
            Vite dynamically boots Cloudflare's open-source `workerd` runtime locally. 1:1 parity with production D1, KV, and R2 bindings.
          </p>
        </div>
        <div className="glass-panel p-8 rounded-2xl border border-gray-100 shadow-sm">
          <Component className="h-8 w-8 text-cf-orange mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">SPA Routing Asset</h3>
          <p className="text-gray-500 leading-relaxed text-sm">
            Uses `assets.not_found_handling`. React Router paths resolve directly from Edge Cache without incurring a single billable Worker invocation.
          </p>
        </div>
      </section>
    </div>
  );
}
