'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { canManageMedicalCertificates } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import { RoleGuard } from '@/components/dashboard/role-guard';

export default function NewMedicalCertificatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    patientId: searchParams.get('patientId') || '',
    type: 'SICK_LEAVE',
    startDate: today,
    endDate: today,
    reason: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('Patient').select('id, fullName, mrn').order('fullName');
      setPatients(data || []);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) { setError('Select a patient.'); return; }
    if (form.startDate > form.endDate) { setError('Start date must be before end date.'); return; }

    setLoading(true);
    setError('');

    const { error: insertError } = await supabase.from('MedicalCertificate').insert({
      hospitalId: user?.hospitalId,
      patientId: form.patientId,
      doctorId: user?.id,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason || null,
      notes: form.notes || null,
    });

    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    router.push('/dashboard/medical-certificates');
  };

  return (
    <RoleGuard allowed={canManageMedicalCertificates(user?.role)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold heading-gradient">New Medical Certificate</h1>
          <Link href="/dashboard/medical-certificates">
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

          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Certificate Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white">
              <option value="SICK_LEAVE" className="text-black">Sick Leave</option>
              <option value="FITNESS" className="text-black">Fitness Certificate</option>
              <option value="OTHER" className="text-black">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">Start Date *</label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">End Date *</label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Reason</label>
            <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Viral fever" className="glass-input px-4 py-3 rounded-lg text-white" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 block mb-2">Additional Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="glass-input w-full px-4 py-3 rounded-lg text-white" />
          </div>

          <Button type="submit" disabled={loading} className="gap-2 gradient-primary">
            <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Issue Certificate'}
          </Button>
        </form>
      </div>
    </RoleGuard>
  );
}
