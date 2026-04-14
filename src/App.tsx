import { Routes, Route, NavLink } from 'react-router-dom';
import { Home, CreditCard, MapPin, MessageSquare, Terminal } from 'lucide-react';
import TestCards from './pages/TestCards';
import FakeAddress from './pages/FakeAddress';
import Forum from './pages/Forum';
import Thread from './pages/Thread';
import { Logo } from './components/Logo';

function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
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

export default function App() {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/test-cards", icon: CreditCard, label: "Cards" },
    { to: "/fake-address", icon: MapPin, label: "Addresses" },
    { to: "/forum", icon: MessageSquare, label: "Forum" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-2xl hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <NavLink to="/" className="font-bold text-xl tracking-tight flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo className="size-8" />
            DevKit Pro
          </NavLink>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-3 mt-4">Utilities</div>
          {navItems.slice(1, 3).map(({ to, icon: Icon, label }) => (
            <NavLink 
              key={to}
              to={to} 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
            >
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
          
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-3 mt-8">Community</div>
          <NavLink 
            to="/forum" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          >
            <MessageSquare className="size-4" /> Developer Forum
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative pb-24 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 glass-nav flex items-center justify-between p-4">
          <NavLink to="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
            <Logo className="size-6" />
            DevKit Pro
          </NavLink>
        </header>
        
        <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/test-cards" element={<TestCards />} />
            <Route path="/fake-address" element={<FakeAddress />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/:id" element={<Thread />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Floating Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50 glass-panel rounded-2xl flex items-center justify-around p-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to}
            to={to} 
            className={({ isActive }) => `flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all ${isActive ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          >
            <Icon className={`size-5 mb-1 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
