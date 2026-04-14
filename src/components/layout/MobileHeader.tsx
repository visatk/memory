import { NavLink } from 'react-router-dom';
import { Logo } from '../Logo';

export function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-40 glass-nav flex items-center justify-between p-4">
      <NavLink to="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
        <Logo className="size-6" />
        DevKit Pro
      </NavLink>
    </header>
  );
}
