'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || `hospital-${Date.now().toString().slice(-6)}`;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ hospitalName: '', adminName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.hospitalName.trim() || !form.adminName.trim() || !form.email.trim() || form.password.length < 6) {
      setError('Please fill in all fields (password must be at least 6 characters).');
      return;
    }

    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    const authUserId = signUpData.user?.id;
    if (!authUserId || !signUpData.session) {
      setLoading(false);
      setSuccess('Account created — check your email to confirm it, then sign in to finish setting up your hospital.');
      return;
    }

    // If a platform admin already manually created this hospital (e.g. for
    // a cash/offline-paying client) with your email pending, claim that
    // instead of creating a duplicate.
    const { data: pendingHospital } = await supabase
      .from('Hospital')
      .select('id, pendingAdminName')
      .eq('pendingAdminEmail', form.email)
      .maybeSingle();

    let hospitalId: string;

    if (pendingHospital) {
      hospitalId = pendingHospital.id;
      await supabase.from('Hospital').update({ pendingAdminEmail: null, pendingAdminName: null }).eq('id', hospitalId);
    } else {
      const { data: newHospital, error: hospError } = await supabase
        .from('Hospital')
        .insert({
          name: form.hospitalName.trim(),
          slug: slugify(form.hospitalName),
          subscriptionStatus: 'PENDING_APPROVAL',
        })
        .select('id')
        .single();

      if (hospError || !newHospital) {
        setError(hospError?.message || 'Failed to create hospital account');
        setLoading(false);
        return;
      }
      hospitalId = newHospital.id;
    }

    const { error: userError } = await supabase.from('User').insert({
      id: authUserId,
      hospitalId,
      fullName: form.adminName.trim(),
      email: form.email,
      role: 'HOSPITAL_ADMIN',
      isActive: true,
      passwordHash: 'SUPABASE_AUTH',
    });

    setLoading(false);
    if (userError) { setError(userError.message); return; }
    router.push('/login');
  };

  return (
    <div className="auth-page-dark min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold heading-gradient">Start Your Hospital Account</h1>
            <p className="text-gray-300 text-sm">PLYXIO Vitals — set up your hospital's own workspace</p>
          </div>

          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 p-3 rounded-lg text-sm">{success}</div>}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Hospital / clinic name" value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" required />
              <Input placeholder="Your full name (as the admin)" value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" required />
              <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" required />
              <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" required minLength={6} />
              <Button type="submit" disabled={loading} className="w-full gradient-primary text-white font-semibold py-3 rounded-lg">
                {loading ? 'Creating account...' : 'Create Hospital Account'}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                New accounts need a quick approval before going live — we'll follow up on payment (online or offline/cash) right after signup.
              </p>
            </form>
          )}

          <div className="text-center pt-2">
            <a href="/login" className="text-xs text-gray-400 hover:text-indigo-300 transition-colors">
              Already have an account? Sign in →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
