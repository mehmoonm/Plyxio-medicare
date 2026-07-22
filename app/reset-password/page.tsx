'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function StaffResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password. The link may have expired — request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl space-y-6">
          <h1 className="text-2xl font-bold text-white">Set a New Password</h1>

          {done ? (
            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 p-4 rounded-lg text-sm">
              Password updated — taking you to your dashboard…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}
              <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input w-full px-4 py-3 rounded-lg text-white" required minLength={6} />
              <Input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="glass-input w-full px-4 py-3 rounded-lg text-white" required minLength={6} />
              <Button type="submit" disabled={loading} className="w-full gradient-primary text-white font-semibold py-3 rounded-lg">
                {loading ? 'Saving...' : 'Save New Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
