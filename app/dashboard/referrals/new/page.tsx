'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { canManageReferrals } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import { RoleGuard } from '@/components/dashboard/role-guard';

export default function NewReferralPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [referralType, setReferralType] = useState<'internal' | 'external'>('internal');
  const [form, setForm] = useState({
    patientId: searchParams.get('patientId') || '',
    referredToDoctorId: '',
    referredToExternal: '',
    specialty: '',
    reason: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const [p, d] = await Promise.all([
        supabase.from('Patient').select('id, fullName, mrn').order('fullName'),
        supabase.from('User').select('id, fullName, specialty').eq('role', 'DOCTOR').eq('isActive', true).neq('id', user?.id || ''),
      ]);
      setPatients(p.data || []);
      setDoctors(d.data || []);
    })();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.reason.trim()) { setError('Patient and reason are required.'); return; }
    if (referralType === 'internal' && !form.referredToDoctorId) { setError('Select which doctor to refer to.'); return; }
    if (referralType === 'external' && !form.referredToExternal.trim()) { setError('Enter the external doctor/hospital name.'); return; }

    setLoading(true);
    setError('');

    const { error: insertError } = await supabase.from('Referral').insert({
      hospitalId: user?.hospitalId,
      patientId: form.patientId,
      referringDoctorId: user?.id,
      referredToDoctorId: referralType === 'internal' ? form.referredToDoctorId : null,
      referredToExternal: referralType === 'external' ? form.referredToExternal.trim() : null,
      specialty: form.specialty || null,
      reason: form.reason.trim(),
      notes: form.notes || null,
    });

    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    router.push('/dashboard/referrals');
  };

  return (
    <RoleGuard allowed={canManageReferrals(user?.role)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold heading-gradient">New Referral</h1>
          <Link href="/dashboard/referrals">
            <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />Cancel</Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5 max-w-2xl">
          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Patient *</label>
            <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white">
              <option value="" className="text-black">Select a patient</option>
              {patients.map((p) => <option key={p.id} value={p.id} className="text-black">{p.fullName} ({p.mrn})</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setReferralType('internal')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${referralType === 'internal' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300'}`}>
              Refer to a doctor here
            </button>
            <button type="button" onClick={() => setReferralType('external')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${referralType === 'external' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300'}`}>
              Refer externally
            </button>
          </div>

          {referralType === 'internal' ? (
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">Referred To *</label>
              <select value={form.referredToDoctorId} onChange={(e) => setForm({ ...form, referredToDoctorId: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white">
                <option value="" className="text-black">Select a doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.id} className="text-black">Dr. {d.fullName}{d.specialty ? ` (${d.specialty})` : ''}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">External Doctor / Hospital *</label>
              <Input value={form.referredToExternal} onChange={(e) => setForm({ ...form, referredToExternal: e.target.value })} placeholder="e.g. Dr. Ahmed Khan, Shifa International" className="glass-input px-4 py-3 rounded-lg text-white" />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Specialty</label>
            <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="e.g. Cardiology, Oncology" className="glass-input px-4 py-3 rounded-lg text-white" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Reason for Referral *</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} className="glass-input w-full px-4 py-3 rounded-lg text-white" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Additional Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="glass-input w-full px-4 py-3 rounded-lg text-white" />
          </div>

          <Button type="submit" disabled={loading} className="gap-2 gradient-primary">
            <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Create Referral'}
          </Button>
        </form>
      </div>
    </RoleGuard>
  );
}
