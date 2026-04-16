import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Calendar, MessageSquarePlus, MessageCircle, Flame } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

type ProfileData = {
  user: { id: number; username: string; createdAt: string; };
  stats: { threads: number; replies: number; };
  recentThreads: { id: number; title: string; category: string; upvotes: number; createdAt: string; }[];
};

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    
    setIsLoading(true);
    fetch(`/api/auth/profile/${username}`)
      // FIX: Explicitly cast the JSON response so TypeScript knows what fields exist
      .then(res => res.json() as Promise<ProfileData & { error?: string }>)
      .then(data => {
        if (data.error) throw new Error(data.error);
        
        // FIX: Tell TypeScript this strictly matches ProfileData now that we passed the error check
        setProfile(data as ProfileData);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [username]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center animate-pulse">
        <div className="size-24 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-6"></div>
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-zinc-500">
        <User className="size-12 mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">User not found</h2>
        <p className="mt-2">The profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto md:py-8 animation-fade-in">
      <SeoHead title={`${profile.user.username}'s Profile`} description={`View ${profile.user.username}'s activity on DevKit Pro.`} />
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 shadow-sm mb-8 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-400"></div>
        
        <div className="size-24 rounded-full bg-orange-500/10 flex items-center justify-center mb-6 border-4 border-white dark:border-zinc-900 shadow-xl">
          <User className="size-10 text-orange-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">{profile.user.username}</h1>
        
        <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium mb-8">
          <Calendar className="size-4" /> Joined {new Date(profile.user.createdAt).toLocaleDateString()}
        </div>
        
        <div className="flex gap-8 w-full max-w-md justify-center border-t border-zinc-100 dark:border-zinc-800/50 pt-8">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{profile.stats.threads}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1">
              <MessageSquarePlus className="size-3.5" /> Threads
            </span>
          </div>
          <div className="w-px bg-zinc-100 dark:bg-zinc-800"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{profile.stats.replies}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1">
              <MessageCircle className="size-3.5" /> Replies
            </span>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-xl mb-6 ml-2 flex items-center gap-2">
        <MessageSquarePlus className="size-5 text-orange-500" /> Recent Threads
      </h3>
      
      <div className="space-y-4 mb-12">
        {profile.recentThreads.length === 0 ? (
           <div className="p-8 text-center bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 border-dashed">
             No threads created yet.
           </div>
        ) : (
          profile.recentThreads.map(thread => (
            <Link 
              key={thread.id} 
              to={`/forum/${thread.id}`} 
              className="flex items-center justify-between p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-orange-500/50 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                    {thread.category}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-500 transition-colors">
                  {thread.title}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-orange-500 font-bold text-sm bg-zinc-50 dark:bg-[#0a0a0a] px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 group-hover:border-orange-500/20 transition-all">
                <Flame className="size-4" /> {thread.upvotes}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
