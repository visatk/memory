import { NavLink } from 'react-router-dom';
import { User, LogIn } from 'lucide-react';
import { Logo } from '../Logo';
import { useAuth } from '../../context/AuthContext';

export function MobileHeader() {
  const { user, isLoading } = useAuth();

  return (
    <header className="md:hidden sticky top-0 z-40 glass-nav flex items-center justify-between p-4">
      <NavLink to="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
        <Logo className="size-6 shrink-0" />
        <span className="truncate">DevKit Pro</span>
      </NavLink>

      <div className="flex items-center">
        {isLoading ? (
           <div className="size-8 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
        ) : user ? (
           <div className="flex items-center gap-2 pl-3 py-1 pr-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-full border border-zinc-200 dark:border-zinc-700/50">
             <span className="text-xs font-semibold text-zinc-900 dark:text-white max-w-[80px] truncate">{user.username}</span>
             <div className="size-7 rounded-full bg-orange-500 flex items-center justify-center shadow-inner shrink-0">
               <User className="size-3.5 text-white" />
             </div>
           </div>
        ) : (
           <NavLink to="/login" className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-xs font-semibold">
             <LogIn className="size-3.5" />
             Sign In
           </NavLink>
        )}
      </div>
    </header>
  );
}
