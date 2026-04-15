import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, MessageCircle, ArrowRight, Search, Flame, Eye } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

const CATEGORIES = ['all', 'general', 'showcase', 'help', 'cloudflare'];

type Thread = {
  id: number;
  title: string;
  category: string;
  author: string;
  upvotes: number;
  views: number;
  createdAt: string;
};

export default function Forum() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const [isPosting, setIsPosting] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', category: 'general', author: '' });

  const fetchThreads = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (activeCategory !== 'all') params.append('category', activeCategory);

    fetch(`/api/forum/threads?${params.toString()}`)
      .then(res => res.json() as Promise<Thread[]>)
      .then(data => { setThreads(data); setIsLoading(false); })
      .catch(console.error);
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchThreads(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchThreads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.content.trim()) return;
    
    setIsPosting(true);
    await fetch('/api/forum/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newThread)
    });
    setNewThread({ title: '', content: '', category: 'general', author: '' });
    setIsPosting(false);
    fetchThreads();
  };

  return (
    <div className="max-w-6xl mx-auto md:py-8 animation-fade-in">
      <SeoHead title="Developer Forum" description="Search, filter, and discuss web development." />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Community Hub</h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">Discover and discuss infrastructure patterns.</p>
        </div>
        
        {/* Advanced Search */}
        <div className="w-full md:w-96 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search discussions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 items-start">
        <div className="w-full lg:col-span-8 space-y-6">
          
          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-md' 
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Thread List */}
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-pulse"></div>
              ))
            ) : threads.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-500 border-dashed">
                <p className="text-lg">No discussions found in this category.</p>
              </div>
            ) : (
              threads.map(thread => (
                <Link 
                  key={thread.id} 
                  to={`/forum/${thread.id}`}
                  className="group flex flex-col sm:flex-row gap-4 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2.5 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        {thread.category}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">{thread.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                      <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md truncate max-w-[150px]">{thread.author}</span>
                    </div>
                  </div>
                  
                  {/* Gamification / Stats Matrix */}
                  <div className="flex sm:flex-col justify-end sm:justify-center items-center gap-4 sm:gap-2 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-4 sm:pt-0 sm:pl-6 shrink-0">
                    <div className="flex items-center gap-1.5 text-orange-500 font-bold" title="Upvotes">
                      <Flame className="size-4" /> {thread.upvotes}
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 font-medium" title="Views">
                      <Eye className="size-4" /> {thread.views}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Compose Thread Sidebar */}
        <div className="w-full lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm lg:sticky lg:top-8">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
            <MessageSquarePlus className="size-5 text-orange-500" /> Start Discussion
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select 
              value={newThread.category}
              onChange={e => setNewThread({...newThread, category: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 capitalize"
            >
              {CATEGORIES.filter(c => c !== 'all').map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input 
              required minLength={5} type="text" placeholder="Thread Title"
              value={newThread.title} onChange={e => setNewThread({...newThread, title: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <textarea 
              required minLength={10} rows={5} placeholder="Markdown supported..."
              value={newThread.content} onChange={e => setNewThread({...newThread, content: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-orange-500/50"
            />
            <input 
              type="text" placeholder="Display Name (Optional)"
              value={newThread.author} onChange={e => setNewThread({...newThread, author: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <button disabled={isPosting || !newThread.title.trim()} className="w-full bg-zinc-900 hover:bg-orange-500 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold py-4 rounded-xl transition-all disabled:opacity-50">
              {isPosting ? 'Posting...' : 'Post Thread'}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}
