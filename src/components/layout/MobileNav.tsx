import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';

export function MobileNav() {
  return (
    <nav className="md:hidden sticky top-[56px] z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-around px-2 py-1 shadow-sm">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink 
          key={to}
          to={to} 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${isActive ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
        >
          {({ isActive }) => (
            <>
              <Icon className={`size-5 mb-1 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
