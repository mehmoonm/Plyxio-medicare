'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '@/lib/patient-auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';

export default function BookAppointmentPage() {
  const router = useRouter();
  const { patient } = usePatientAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', reason: '' });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('User').select('id, fullName, specialty').eq('role', 'DOCTOR').eq('isActive', true);
      setDoctors(data || []);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    if (!form.doctorId || !form.date || !form.time) {
      setError('Please select a doctor, date, and time.');
      return;
    }
    setLoading(true);
    setError('');
    const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();
    const { error: insertError } = await supabase.from('Appointment').insert({
      hospitalId: patient.hospitalId,
      patientId: patient.id,
      doctorId: form.doctorId,
      scheduledAt,
      reason: form.reason || null,
      status: 'SCHEDULED',
    });
    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    router.push('/portal/appointments');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Book an Appointment</h1>
        <Link href="/portal/appointments">
          <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />Cancel</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5 max-w-xl">
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="text-sm font-semibold text-gray-200 block mb-2">Doctor *</label>
          <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white">
            <option value="" className="text-black">Select a doctor</option>
            {doctors.map((d) => <option key={d.id} value={d.id} className="text-black">{d.fullName} — {d.specialty || 'General'}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-200 block mb-2">Date *</label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-200 block mb-2">Time *</label>
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="glass-input w-full px-4 py-3 rounded-lg text-white" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-200 block mb-2">Reason for Visit</label>
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} className="glass-input w-full px-4 py-3 rounded-lg text-white resize-none" />
        </div>

        <Button type="submit" disabled={loading} className="gap-2 gradient-primary">
          <Save className="w-4 h-4" />{loading ? 'Booking...' : 'Book Appointment'}
        </Button>
      </form>
    </div>
  );
}
