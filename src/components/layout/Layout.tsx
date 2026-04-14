import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-[#0a0a0a]">
      <Sidebar />
      
      <main className="flex-1 w-full relative pb-24 md:pb-0 flex flex-col min-h-screen">
        <MobileHeader />
        
        {/* The Outlet renders the current route's element */}
        <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
        
        <Footer />
      </main>

      <MobileNav />
    </div>
  );
}
