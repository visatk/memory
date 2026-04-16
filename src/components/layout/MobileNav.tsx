import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-around p-2 rounded-2xl shadow-2xl shadow-black/5 dark:shadow-black/40">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink 
          key={to}
          to={to} 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 relative ${isActive ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
        >
          {({ isActive }) => (
            <>
              {/* Active state background highlight */}
              {isActive && <div className="absolute inset-0 bg-orange-500/10 rounded-xl z-0"></div>}
              
              <Icon className={`size-5 mb-1 transition-transform relative z-10 ${isActive ? 'scale-110 drop-shadow-sm' : 'scale-100'}`} />
              <span className="text-[10px] font-semibold tracking-wide relative z-10">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
