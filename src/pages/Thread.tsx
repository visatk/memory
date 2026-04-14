import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Clock, MessageCircle, Send } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

type Reply = {
  id: number;
  content: string;
  author: string;
  createdAt: string;
};

type ThreadDetail = {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  replies: Reply[];
};

export default function Thread() {
  const { id } = useParams();
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const fetchThread = () => {
    fetch(`/api/forum/threads/${id}`)
      .then(res => res.json() as Promise<ThreadDetail & { error?: string }>)
      .then(data => {
        if (!data.error) {
          // Assert as ThreadDetail since we verified it's not an error
          setThread(data as ThreadDetail); 
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchThread();
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReplying(true);
    await fetch(`/api/forum/threads/${id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent, author: replyAuthor })
    });
    setReplyContent('');
    setIsReplying(false);
    fetchThread();
  };

  if (!thread) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex flex-col items-center justify-center animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-6"></div>
        <div className="h-32 w-full bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto md:py-8 animation-fade-in">
      <SeoHead title={thread.title} description={thread.content.substring(0, 150)} />
      
      <Link to="/forum" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:shadow-sm transition-all mb-8 w-fit">
        <ArrowLeft className="size-4" /> Back to Discussions
      </Link>

      {/* Original Post */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-balance leading-tight">{thread.title}</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed text-base md:text-lg">{thread.content}</p>
        </div>
        
        <div className="mt-8 pt-5 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-zinc-500 font-medium">
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
            <User className="size-4 text-orange-500" /> 
            <span className="text-zinc-900 dark:text-zinc-100">{thread.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-4" /> 
            {new Date(thread.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
        </div>
      </div>

      {/* Replies Section */}
      <div className="space-y-4 mb-10">
        <h3 className="font-bold text-xl flex items-center gap-2 mb-6 ml-2">
          <MessageCircle className="size-5 text-zinc-400" />
          {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>
        
        {thread.replies.map(reply => (
          <div key={reply.id} className="bg-white/50 dark:bg-[#0a0a0a]/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 ml-0 md:ml-8 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
            <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap text-sm md:text-base leading-relaxed mb-4">{reply.content}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
              <span className="flex items-center gap-1.5"><User className="size-3.5 text-zinc-400" /> <span className="text-zinc-800 dark:text-zinc-200">{reply.author}</span></span>
              <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-zinc-400" /> {new Date(reply.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      <div className="bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-900/30 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle orange accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400"></div>
        
        <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
          Join the Conversation
        </h4>
        <form onSubmit={handleReply} className="space-y-4">
          <textarea 
            required
            rows={4}
            placeholder="Type your reply here..."
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4 text-sm md:text-base outline-none resize-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-400"
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Display Name (Optional)"
              value={replyAuthor}
              onChange={e => setReplyAuthor(e.target.value)}
              className="flex-1 bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
            <button 
              disabled={isReplying}
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer"
            >
              <Send className="size-4" />
              {isReplying ? 'Sending...' : 'Post Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
