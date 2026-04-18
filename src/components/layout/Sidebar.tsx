import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User } from 'lucide-react';
import { Logo } from '../Logo';
import { NAV_ITEMS } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const utilities = NAV_ITEMS.filter(item => item.group === 'Utilities');
  const community = NAV_ITEMS.filter(item => item.group === 'Community');
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex h-full w-64 lg:w-72 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0a0a0a]">
      {/* Header / Logo */}
      <div className="flex h-14 items-center border-b border-zinc-200 dark:border-zinc-800 px-4 lg:h-[60px] lg:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
          <Logo className="h-6 w-6" />
          <span className="text-zinc-900 dark:text-zinc-100">DevKit Pro</span>
        </NavLink>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 overflow-auto py-4 custom-scrollbar">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          <div className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Utilities</div>
          {utilities.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${isActive ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 font-medium'}`}>
              <Icon className="h-4 w-4" /> 
              {label}
            </NavLink>
          ))}
          
          <div className="px-2 py-2 mt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Community</div>
          {community.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${isActive ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 font-medium'}`}>
              <Icon className="h-4 w-4" /> 
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Auth Footer */}
      <div className="mt-auto border-t border-zinc-200 dark:border-zinc-800 p-4">
        {isLoading ? (
          <div className="h-10 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800"></div>
        ) : user ? (
          <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
            <Link to={`/profile/${user.username}`} className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0">
                <User className="h-4 w-4 text-zinc-50 dark:text-zinc-900" />
              </div>
              <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.username}</span>
            </Link>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-red-500 transition-colors" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 transition-colors">
            <LogIn className="h-4 w-4" />
            Sign In
          </NavLink>
        )}
      </div>
    </aside>
  );
}
