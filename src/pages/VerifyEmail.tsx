import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided in the URL.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (data.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('A network error occurred while verifying.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4 animation-fade-in relative z-10">
      <SeoHead title="Email Verification" description="Verify your DevKit Pro account." />
      
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400"></div>
        
        {status === 'loading' && (
          <>
            <div className="mx-auto size-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="size-8 text-orange-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3">Authenticating</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto size-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
              <CheckCircle2 className="size-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3">Account Verified</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">{message}</p>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              Continue to Sign In <ArrowRight className="size-4" />
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto size-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <XCircle className="size-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3">Verification Failed</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">{message}</p>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 w-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold py-3.5 rounded-xl transition-all">
              Return to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
