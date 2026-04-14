import { Terminal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 py-8 px-4 md:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="size-4" />
          <span>© {new Date().getFullYear()} DevKit Pro. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer">Terms of Service</span>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Systems Operational
          </span>
        </div>
      </div>
    </footer>
  );
}
