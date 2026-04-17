import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';

export function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* The outer container blocks pointer events to allow clicking "through" the empty space,
        while the inner nav re-enables them.
      */}
      <nav className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-full shadow-2xl shadow-zinc-900/10 dark:shadow-black/50">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to}
            to={to} 
            title={label}
            className={({ isActive }) => 
              `relative flex items-center justify-center px-4 py-3 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                isActive 
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center justify-center overflow-hidden">
                <Icon 
                  className={`size-5 shrink-0 transition-transform duration-300 ${
                    isActive ? 'scale-110 drop-shadow-sm text-orange-500 dark:text-orange-600' : 'scale-100'
                  }`} 
                />
                
                {/* Expanding label animation */}
                <span 
                  className={`font-semibold text-sm whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center ${
                    isActive 
                      ? 'max-w-[100px] ml-2.5 opacity-100 translate-x-0' 
                      : 'max-w-0 ml-0 opacity-0 -translate-x-2'
                  }`}
                >
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
