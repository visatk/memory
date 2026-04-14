import { NavLink } from 'react-router-dom';
import { Logo } from '../Logo';
import { NAV_ITEMS } from '../../config/navigation';

export function Sidebar() {
  const utilities = NAV_ITEMS.filter(item => item.group === 'Utilities');
  const community = NAV_ITEMS.filter(item => item.group === 'Community');

  return (
    <aside className="border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-2xl hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300 w-20 lg:w-72 z-40">
      <div className="p-4 lg:p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-center lg:justify-start">
        <NavLink to="/" className="font-bold text-xl tracking-tight flex items-center gap-3 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg">
          <Logo className="size-8 shrink-0" />
          <span className="hidden lg:block">DevKit Pro</span>
        </NavLink>
      </div>
      
      <nav className="flex-1 p-3 lg:p-4 flex flex-col gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="hidden lg:block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-3 mt-4">Utilities</div>
        <div className="lg:hidden w-full h-px bg-zinc-200 dark:bg-zinc-800 my-2"></div>
        
        {utilities.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to}
            to={to} 
            title={label}
            className={({ isActive }) => `group flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-3 lg:py-2.5 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          >
            <Icon className="size-5 lg:size-4 shrink-0 transition-transform group-hover:scale-110 lg:group-hover:scale-100" /> 
            <span className="hidden lg:block whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
        
        <div className="hidden lg:block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-3 mt-8">Community</div>
        <div className="lg:hidden w-full h-px bg-zinc-200 dark:bg-zinc-800 my-2 mt-4"></div>
        
        {community.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to}
            to={to} 
            title={label}
            className={({ isActive }) => `group flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-3 lg:py-2.5 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          >
            <Icon className="size-5 lg:size-4 shrink-0 transition-transform group-hover:scale-110 lg:group-hover:scale-100" /> 
            <span className="hidden lg:block whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
