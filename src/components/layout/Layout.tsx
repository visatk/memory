import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="flex min-h-screen w-full bg-zinc-50/30 dark:bg-[#0a0a0a]">
      {/* Shadcn Desktop Sidebar */}
      <Sidebar />
      
      {/* Content Wrapper offset by the fixed sidebar width on desktop */}
      <div className="flex flex-col flex-1 w-full md:pl-64 lg:pl-72 transition-all duration-300">
        <MobileHeader />
        
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pt-6">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
