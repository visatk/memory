import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Clock, MessageCircle, Send, Flame, Bold, Italic, Code, Pin, LockKeyhole, Trash2, ShieldAlert } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { useAuth } from '../context/AuthContext';

type Reply = { id: number; content: string; author: string; upvotes: number; createdAt: string; };
type ThreadDetail = { id: number; title: string; content: string; category: string; author: string; authorId: number; upvotes: number; views: number; isPinned: boolean; isLocked: boolean; createdAt: string; replies: Reply[]; };

export default function Thread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isModerator = user?.role === 'admin' || user?.role === 'moderator';
  const isAuthor = user?.username === thread?.author;

  const fetchThread = () => {
    fetch(`/api/forum/threads/${id}`)
      .then(res => res.json() as Promise<ThreadDetail & { error?: string }>)
      .then(data => { if (!data.error) setThread(data as ThreadDetail); })
      .catch(console.error);
  };

  useEffect(() => { fetchThread(); }, [id]);

  const handleVote = async (type: 'thread' | 'reply', targetId: number) => {
    if (!thread) return;
    if (type === 'thread') {
      setThread({ ...thread, upvotes: thread.upvotes + 1 });
    } else {
      setThread({ ...thread, replies: thread.replies.map(r => r.id === targetId ? { ...r, upvotes: r.upvotes + 1 } : r) });
    }
    await fetch(`/api/forum/vote/${type}/${targetId}`, { method: 'POST' });
  };

  const handleModeration = async (action: 'pin' | 'lock' | 'delete') => {
    if (!thread) return;
    
    if (action === 'delete') {
      if (!confirm('Are you sure you want to permanently delete this thread?')) return;
      await fetch(`/api/forum/threads/${thread.id}`, { method: 'DELETE' });
      navigate('/');
      return;
    }

    const res = await fetch(`/api/forum/threads/${thread.id}/${action}`, { method: 'PATCH' });
    if (res.ok) {
      const updated = await res.json() as ThreadDetail;
      setThread({ ...thread, isPinned: updated.isPinned, isLocked: updated.isLocked });
    }
  };

  const insertFormatting = (prefix: string, suffix: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = replyContent;
    const selected = text.substring(start, end) || 'text';
    const newText = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
    setReplyContent(newText);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;
    setIsReplying(true);
    await fetch(`/api/forum/threads/${id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent })
    });
    setReplyContent('');
    setIsReplying(false);
    fetchThread();
  };

  if (!thread) return <div className="max-w-3xl mx-auto py-12 flex flex-col items-center animate-pulse"><div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-6"></div><div className="h-32 w-full bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div></div>;

  return (
    <div className="max-w-4xl mx-auto md:py-8 animation-fade-in">
      <SeoHead title={thread.title} description={thread.content.substring(0, 150)} />
      
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:shadow-sm transition-all">
          <ArrowLeft className="size-4" /> Back to Discussions
        </Link>
        
        {(isModerator || isAuthor) && (
          <div className="flex gap-2">
            {isModerator && (
              <>
                <button onClick={() => handleModeration('pin')} className={`p-2 rounded-lg border transition-colors ${thread.isPinned ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-orange-500'}`} title={thread.isPinned ? "Unpin Thread" : "Pin Thread"}>
                  <Pin className="size-4" />
                </button>
                <button onClick={() => handleModeration('lock')} className={`p-2 rounded-lg border transition-colors ${thread.isLocked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500'}`} title={thread.isLocked ? "Unlock Thread" : "Lock Thread"}>
                  <LockKeyhole className="size-4" />
                </button>
              </>
            )}
            <button onClick={() => handleModeration('delete')} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-colors" title="Delete Thread">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>

      <div className={`bg-white dark:bg-zinc-900 border rounded-3xl p-6 md:p-8 shadow-sm mb-8 flex gap-6 ${thread.isPinned ? 'border-orange-500/30' : 'border-zinc-200 dark:border-zinc-800'}`}>
        <div className="hidden sm:flex flex-col items-center gap-2 pt-2">
          <button onClick={() => handleVote('thread', thread.id)} className="p-2 text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-xl transition-all cursor-pointer">
            <Flame className="size-6" />
          </button>
          <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{thread.upvotes}</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
             {thread.isPinned && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400"><Pin className="size-3" /> Pinned</span>}
             {thread.isLocked && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"><LockKeyhole className="size-3" /> Locked</span>}
             <span className="px-2.5 py-1 bg-orange-500/10 text-orange-600 text-[10px] font-bold uppercase tracking-wider rounded-md">{thread.category}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-balance leading-tight">{thread.title}</h1>
          <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed text-base">{thread.content}</p>
          
          <div className="mt-8 pt-5 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
            <div className="flex items-center gap-4 text-zinc-500">
              <Link to={`/profile/${thread.author}`} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors px-3 py-1.5 rounded-lg">
                <User className="size-4 text-orange-500" /> 
                <span className="text-zinc-900 dark:text-zinc-100">{thread.author}</span>
              </Link>
              <span className="flex items-center gap-1.5"><Clock className="size-4" /> {new Date(thread.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        <h3 className="font-bold text-xl flex items-center gap-2 mb-6 ml-2"><MessageCircle className="size-5 text-zinc-400" /> {thread.replies.length} Replies</h3>
        {thread.replies.map(reply => (
          <div key={reply.id} className="bg-white/50 dark:bg-[#0a0a0a]/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 ml-0 md:ml-8 flex gap-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex-1">
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap text-sm md:text-base leading-relaxed mb-4">{reply.content}</p>
              <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 group">
                <Link to={`/profile/${reply.author}`} className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                  <User className="size-3.5 text-zinc-400 group-hover:text-orange-500 transition-colors" /> 
                  <span className="text-zinc-800 dark:text-zinc-200 group-hover:text-orange-500 transition-colors">{reply.author}</span>
                </Link>
                <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-zinc-400" /> {new Date(reply.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-start gap-1">
               <button onClick={() => handleVote('reply', reply.id)} className="p-1.5 text-zinc-400 hover:text-orange-500 rounded-lg cursor-pointer"><Flame className="size-4" /></button>
               <span className="text-xs font-bold">{reply.upvotes}</span>
            </div>
          </div>
        ))}
      </div>

      {thread.isLocked && !isModerator ? (
         <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-[#0a0a0a] rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center">
           <ShieldAlert className="size-10 text-zinc-400 mb-3" />
           <h4 className="font-bold text-lg mb-1">Thread Locked</h4>
           <p className="text-sm text-zinc-500">A moderator has closed this discussion. No further replies can be added.</p>
         </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-900/30 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400"></div>
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            Post a Reply {thread.isLocked && <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-md uppercase tracking-wider">Moderator Override</span>}
          </h4>
          
          {user ? (
            <form onSubmit={handleReply} className="space-y-3">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50 dark:bg-[#0a0a0a] focus-within:ring-2 focus-within:ring-orange-500/50 transition-all">
                <div className="flex items-center gap-1 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
                  <button type="button" onClick={() => insertFormatting('**', '**')} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"><Bold className="size-4" /></button>
                  <button type="button" onClick={() => insertFormatting('*', '*')} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"><Italic className="size-4" /></button>
                  <button type="button" onClick={() => insertFormatting('`', '`')} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"><Code className="size-4" /></button>
                </div>
                <textarea ref={textareaRef} required rows={4} placeholder="Markdown formatting is supported..." value={replyContent} onChange={e => setReplyContent(e.target.value)} className="w-full bg-transparent px-4 py-3 text-sm md:text-base outline-none resize-none placeholder:text-zinc-400 custom-scrollbar" />
              </div>
              <div className="flex justify-end pt-2">
                <button disabled={isReplying || !replyContent.trim()} className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer">
                  <Send className="size-4" /> {isReplying ? 'Sending...' : 'Post Reply'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-[#0a0a0a] rounded-xl border border-zinc-200 dark:border-zinc-800">
               <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">Please log in to reply to this thread.</p>
               <Link to="/login" className="px-6 py-2.5 bg-zinc-900 hover:bg-orange-500 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-orange-500 dark:hover:text-white rounded-lg font-semibold transition-colors shadow-md">Sign In</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
