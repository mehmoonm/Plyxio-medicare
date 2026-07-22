'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '@/lib/patient-auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEMO_HOSPITAL_ID = '57497c75-d23c-4b87-acae-0927b2702e25';

export default function PortalLoginPage() {
  const router = useRouter();
  const { login, register } = usePatientAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ fullName: '', email: '', phone: '', cnic: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      router.push('/portal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register({
        email: regForm.email,
        password: regForm.password,
        fullName: regForm.fullName,
        phone: regForm.phone || undefined,
        cnic: regForm.cnic || undefined,
        hospitalId: DEMO_HOSPITAL_ID,
      });
      router.push('/portal');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      if (message.toLowerCase().includes('confirm')) {
        setSuccess(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              MediCare Patient Portal
            </h1>
            <p className="text-gray-300 text-sm">View records, book visits, pay bills, message your doctor</p>
          </div>

          <div className="flex bg-white/5 rounded-lg p-1">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'login' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}>
              Sign In
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'register' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}>
              Create Account
            </button>
          </div>

          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 p-3 rounded-lg text-sm">{success}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="email" placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" required />
              <Input type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" required />
              <Button type="submit" disabled={loading} className="w-full gradient-primary text-white font-semibold py-3 rounded-lg">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input placeholder="Full name" value={regForm.fullName} onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" required />
              <Input type="email" placeholder="Email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" required />
              <p className="text-xs text-gray-400 -mt-2">If the hospital already has your email on file, this will link to your existing records.</p>
              <Input placeholder="Phone" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" />
              <Input placeholder="CNIC (optional)" value={regForm.cnic} onChange={(e) => setRegForm({ ...regForm, cnic: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" />
              <Input type="password" placeholder="Password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" required minLength={6} />
              <Button type="submit" disabled={loading} className="w-full gradient-primary text-white font-semibold py-3 rounded-lg">
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          )}

          <div className="text-center">
            <a href="/login" className="text-xs text-gray-400 hover:text-indigo-300 transition-colors">
              Hospital staff? Sign in here →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
