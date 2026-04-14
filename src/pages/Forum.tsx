import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { MessageSquarePlus, MessageCircle } from 'lucide-react';
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
      .then(res => res.json())
      .then(setThreads)
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
    <div className="max-w-4xl mx-auto py-8">
      <SeoHead 
        title="Developer Forum" 
        description="Discuss web development, Cloudflare infrastructure, and testing tools with the community." 
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Community Forum</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Ask questions, share code, and discuss infrastructure.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {threads.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500">
              No threads yet. Be the first to start a discussion!
            </div>
          ) : (
            threads.map(thread => (
              <Link 
                key={thread.id} 
                to={`/forum/${thread.id}`}
                className="block p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-orange-500/50 transition-colors shadow-sm"
              >
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-2">{thread.title}</h3>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><MessageCircle className="size-3" /> Discuss</span>
                  <span>By {thread.author}</span>
                  <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Create Thread Sidebar Form */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm h-fit sticky top-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
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
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <textarea 
                required
                rows={4}
                placeholder="What's on your mind?"
                value={newThread.content}
                onChange={e => setNewThread({...newThread, content: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Display Name (Optional)"
                value={newThread.author}
                onChange={e => setNewThread({...newThread, author: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <button 
              disabled={isPosting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isPosting ? 'Posting...' : 'Post Thread'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
