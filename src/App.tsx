import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router';
import JsonFormatter from './tools/JsonFormatter';
import JwtInspector from './tools/JwtInspector';

interface ToolMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  path: string;
}

function ToolRegistry() {
  const [tools, setTools] = useState<ToolMeta[]>([]);

  useEffect(() => {
    fetch('/api/tools')
      .then(res => res.json())
      .then(setTools)
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map(tool => (
        <NavLink 
          key={tool.id} 
          to={tool.path}
          className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-orange-500/50 hover:shadow-md transition-all group flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-500 transition-colors">
              {tool.name}
            </h3>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-md">
              {tool.category}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed flex-grow">
            {tool.description}
          </p>
        </NavLink>
      ))}
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-orange-500/30 overflow-hidden">
      {/* Sidebar Layout */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <NavLink to="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="size-6 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-lg shadow-sm"></div>
            DevKit
          </NavLink>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 mt-4 px-2">Data Tools</div>
          <NavLink to="/tools/json-formatter" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}>
            JSON Formatter
          </NavLink>
          
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 mt-6 px-2">Security</div>
          <NavLink to="/tools/jwt-inspector" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}>
            JWT Inspector
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
           <NavLink to="/" className="font-bold text-lg flex items-center gap-2">
            <div className="size-5 bg-orange-500 rounded-md"></div>
            DevKit
          </NavLink>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            {isHome && (
              <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-3">Developer Tools</h1>
                <p className="text-zinc-500 dark:text-zinc-400">High-performance, browser-native utilities running locally on your machine.</p>
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ToolRegistry />} />
        <Route path="/tools/json-formatter" element={<JsonFormatter />} />
        <Route path="/tools/jwt-inspector" element={<JwtInspector />} />
      </Routes>
    </Layout>
  );
}
