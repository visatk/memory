import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, MessageCircle, ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

type Thread = {
  id: number;
  title: string;
  author: string;
  createdAt: string;
};

export default function Forum() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', author: '' });

  const fetchThreads = () => {
    fetch('/api/forum/threads')
      .then(res => res.json() as Promise<Thread[]>)
      .then(data => setThreads(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    await fetch('/api/forum/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newThread)
    });
    setNewThread({ title: '', content: '', author: '' });
    setIsPosting(false);
    fetchThreads();
  };

  return (
    <div className="max-w-6xl mx-auto md:py-8">
      <SeoHead 
        title="Developer Forum" 
        description="Discuss web development, Cloudflare infrastructure, and testing tools with the community." 
      />
      
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Community Forum</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Ask questions, share code, and discuss infrastructure.</p>
      </div>

      {/* Reverse stack on mobile: Form first, then threads, but on Desktop Form is right sidebar */}
      <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Threads List */}
        <div className="w-full lg:col-span-8 space-y-4">
          {threads.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-500 border-dashed">
              <MessageCircle className="size-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No threads yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            threads.map(thread => (
              <Link 
                key={thread.id} 
                to={`/forum/${thread.id}`}
                className="group block p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-orange-500 transition-colors">{thread.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-zinc-500">
                      <span className="flex items-center gap-1.5"><MessageCircle className="size-3.5" /> Discuss</span>
                      <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">By {thread.author}</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ArrowRight className="size-5 text-zinc-300 dark:text-zinc-700 group-hover:text-orange-500 transition-colors shrink-0 mt-1" />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Create Thread Form - Sticky on Desktop */}
        <div className="w-full lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm lg:sticky lg:top-8">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
            <MessageSquarePlus className="size-5 text-orange-500" />
            Start a Discussion
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                required
                type="text" 
                placeholder="Thread Title"
                value={newThread.title}
                onChange={e => setNewThread({...newThread, title: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-400"
              />
            </div>
            <div>
              <textarea 
                required
                rows={5}
                placeholder="What's on your mind? Drop your code or questions..."
                value={newThread.content}
                onChange={e => setNewThread({...newThread, content: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-400"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Display Name (Optional)"
                value={newThread.author}
                onChange={e => setNewThread({...newThread, author: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-400"
              />
            </div>
            <button 
              disabled={isPosting}
              className="w-full bg-zinc-900 hover:bg-orange-500 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-orange-500 dark:hover:text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer"
            >
              {isPosting ? 'Posting to D1...' : 'Post Thread'}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}
