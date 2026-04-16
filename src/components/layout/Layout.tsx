import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Premium Developer Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      </div>
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/10 dark:bg-orange-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <Sidebar />
      
      <main className="flex-1 w-full relative z-10 flex flex-col min-h-screen">
        <MobileHeader />
        <MobileNav />
        
        {/* The Outlet renders the current route's element */}
        <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
        
        <Footer />
      </main>
    </div>
  );
}
