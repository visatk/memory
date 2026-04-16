import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // FIX: Included 'username' in the payload
        body: JSON.stringify({ username, email, password }) 
      });
      
      const data = await res.json() as any;
      
      if (!res.ok) {
        // FIX: Safely parse complex validation error objects from Zod
        let errMsg = 'Registration failed';
        if (typeof data.error === 'string') {
          errMsg = data.error;
        } else if (data.error?.issues?.[0]?.message) {
          errMsg = data.error.issues[0].message;
        } else if (typeof data.error === 'object') {
          errMsg = 'Invalid input provided';
        }
        throw new Error(errMsg);
      }
      
      await refreshUser();
      navigate('/forum');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4 animation-fade-in relative z-10">
      <SeoHead title="Create Account" description="Join the DevKit Pro developer community." />
      
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400"></div>
        
        <div className="text-center mb-8">
          <div className="mx-auto size-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 border border-orange-500/20">
            <UserPlus className="size-6 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">Join the developer community</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl text-center font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
            <input required minLength={3} maxLength={30} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-400" />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
            <input required type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-400" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
            <input required minLength={8} type="password" placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-400" />
          </div>
          <button disabled={isSubmitting} className="w-full bg-zinc-900 hover:bg-orange-500 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-orange-500 dark:hover:text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-2">
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-8">
          Already have an account? <Link to="/login" className="font-semibold text-zinc-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
