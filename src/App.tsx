import { Routes, Route, NavLink } from 'react-router';
import TestCards from './pages/TestCards';
import FakeAddress from './pages/FakeAddress';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-4xl font-bold tracking-tight mb-4">Developer Tools, <span className="text-orange-500">Zero Latency.</span></h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mb-8">
        Free, browser-native tools built for developers. No tracking, no logins, no server-side data hoarding.
      </p>
      <div className="flex gap-4">
        <NavLink to="/test-cards" className="px-6 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-medium hover:scale-105 transition-transform">
          Credit Card Generator
        </NavLink>
        <NavLink to="/fake-address" className="px-6 py-3 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white rounded-xl font-medium hover:scale-105 transition-transform">
          Address Generator
        </NavLink>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex selection:bg-orange-500/30">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="size-6 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-lg"></div>
            DevKit Pro
          </div>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-3 mt-4">Generators</div>
          <NavLink 
            to="/test-cards" 
            className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
          >
            Credit Cards
          </NavLink>
          <NavLink 
            to="/fake-address" 
            className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
          >
            Fake Addresses
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="font-bold text-lg tracking-tight">DevKit Pro</div>
        </header>
        
        <div className="p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test-cards" element={<TestCards />} />
            <Route path="/fake-address" element={<FakeAddress />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
