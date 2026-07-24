'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';

export default function SecurityPage() {
  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollData, setEnrollData] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEnroll = async () => {
    setError('');
    setEnrolling(true);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (enrollError) { setError(enrollError.message); setEnrolling(false); return; }
    setEnrollData({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  };

  const confirmEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollData) return;
    setBusy(true);
    setError('');
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: enrollData.factorId });
    if (challengeError) { setError(challengeError.message); setBusy(false); return; }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollData.factorId,
      challengeId: challenge.id,
      code: verifyCode,
    });
    setBusy(false);
    if (verifyError) { setError(verifyError.message); return; }

    setSuccess('Two-factor authentication is now enabled on your account.');
    setEnrolling(false);
    setEnrollData(null);
    setVerifyCode('');
    await load();
  };

  const disable2fa = async (factorId: string) => {
    if (!confirm("Disable two-factor authentication? You'll only need your password to sign in after this.")) return;
    setBusy(true);
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (unenrollError) { setError(unenrollError.message); return; }
    setSuccess('Two-factor authentication has been disabled.');
    await load();
  };

  const cancelEnroll = () => {
    setEnrolling(false);
    setEnrollData(null);
    setVerifyCode('');
    setError('');
  };

  const isEnabled = factors.some((f) => f.status === 'verified');

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold heading-gradient flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-indigo-300" />Security
        </h1>
        <p className="text-gray-400 mt-2">Protect your account with two-factor authentication</p>
      </div>

      {success && <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 p-3 rounded-lg text-sm">{success}</div>}
      {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}

      <div className="glass-card rounded-2xl p-6 space-y-4">
        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : enrolling && enrollData ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Smartphone className="w-5 h-5 text-indigo-300" />
              Scan this with your authenticator app
            </div>
            <div className="bg-white p-4 rounded-xl w-fit mx-auto" dangerouslySetInnerHTML={{ __html: enrollData.qrCode }} />
            <p className="text-xs text-gray-400 text-center">
              Can't scan? Enter this code manually: <span className="font-mono text-gray-300">{enrollData.secret}</span>
            </p>
            <form onSubmit={confirmEnroll} className="space-y-3">
              <label className="text-sm font-semibold text-gray-300 block">Enter the 6-digit code from your app</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="glass-input px-4 py-3 rounded-lg text-white text-center text-xl tracking-[0.4em]"
                maxLength={6}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={busy || verifyCode.length !== 6} className="gradient-primary">{busy ? 'Verifying...' : 'Confirm & Enable'}</Button>
                <Button type="button" variant="outline" onClick={cancelEnroll}>Cancel</Button>
              </div>
            </form>
          </div>
        ) : isEnabled ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-white font-semibold">Two-Factor Authentication is ON</p>
                <p className="text-xs text-gray-400">You'll be asked for a code from your authenticator app each time you sign in.</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => disable2fa(factors.find((f) => f.status === 'verified')!.id)} disabled={busy} className="gap-2 text-red-400 border-red-400/50">
              <ShieldOff className="w-4 h-4" />Disable
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ShieldOff className="w-8 h-8 text-gray-500" />
              <div>
                <p className="text-white font-semibold">Two-Factor Authentication is OFF</p>
                <p className="text-xs text-gray-400">Add an extra layer of security using an authenticator app (Google Authenticator, Authy, etc).</p>
              </div>
            </div>
            <Button onClick={startEnroll} className="gap-2 gradient-primary"><ShieldCheck className="w-4 h-4" />Enable 2FA</Button>
          </div>
        )}
      </div>
    </div>
  );
}
