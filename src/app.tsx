import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Server, Activity, Database, Cloud } from 'lucide-react';
import Home from './pages/Home';
import Telemetry from './pages/Telemetry';
import DataLayer from './pages/DataLayer';

// Scalable App Layout with Routing logic
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Overview', icon: Cloud },
    { path: '/telemetry', label: 'Edge Telemetry', icon: Activity },
    { path: '/data', label: 'D1 Database', icon: Database },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50 glass-panel border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Server className="h-6 w-6 text-cf-orange" />
              <span className="font-bold text-xl tracking-tight text-cf-dark">Cloudflare V8 Stack</span>
            </div>
            <nav className="flex gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-cf-orange' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/telemetry" element={<Telemetry />} />
          <Route path="/data" element={<DataLayer />} />
          {/* Handled by assets.not_found_handling in wrangler.jsonc seamlessly! */}
          <Route path="*" element={<div className="text-center py-20 text-gray-500 font-medium">404 - SPA Route Not Found</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
