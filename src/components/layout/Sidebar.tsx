import { NavLink } from 'react-router-dom';
import { Logo } from '../Logo';
import { NAV_ITEMS } from '../../config/navigation';

export function Sidebar() {
  const utilities = NAV_ITEMS.filter(item => item.group === 'Utilities');
  const community = NAV_ITEMS.filter(item => item.group === 'Community');

  return (
    <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-2xl hidden md:flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <NavLink to="/" className="font-bold text-xl tracking-tight flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo className="size-8" />
          DevKit Pro
        </NavLink>
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-3 mt-4">Utilities</div>
        {utilities.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to}
            to={to} 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          >
            <Icon className="size-4" /> {label}
          </NavLink>
        ))}
        
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-3 mt-8">Community</div>
        {community.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to}
            to={to} 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          >
            <Icon className="size-4" /> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
