import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, User, Clock } from 'lucide-react';
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
      .then(res => res.json())
      .then(data => {
        if (!data.error) setThread(data);
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

  if (!thread) return <div className="p-8 text-center animate-pulse">Loading thread...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <SeoHead title={thread.title} description={thread.content.substring(0, 150)} />
      
      <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft className="size-4" /> Back to Forum
      </Link>

      {/* Original Post */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-8">
        <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
        <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{thread.content}</p>
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><User className="size-3" /> {thread.author}</span>
          <span className="flex items-center gap-1"><Clock className="size-3" /> {new Date(thread.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4 mb-8">
        <h3 className="font-semibold text-lg border-b border-zinc-200 dark:border-zinc-800 pb-2">Replies ({thread.replies.length})</h3>
        {thread.replies.map(reply => (
          <div key={reply.id} className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap text-sm mb-3">{reply.content}</p>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><User className="size-3" /> {reply.author}</span>
              <span className="flex items-center gap-1"><Clock className="size-3" /> {new Date(reply.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      <div className="bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-900/30 rounded-2xl p-6 shadow-sm">
        <h4 className="font-semibold mb-4">Add a Reply</h4>
        <form onSubmit={handleReply} className="space-y-4">
          <textarea 
            required
            rows={3}
            placeholder="Type your reply here..."
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-orange-500/50"
          />
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Display Name (Optional)"
              value={replyAuthor}
              onChange={e => setReplyAuthor(e.target.value)}
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <button 
              disabled={isReplying}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isReplying ? 'Posting...' : 'Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
