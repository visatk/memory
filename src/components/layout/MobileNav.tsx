import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50 glass-panel rounded-2xl flex items-center justify-around p-2">
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
