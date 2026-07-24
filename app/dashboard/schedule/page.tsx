'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Clock, Plus, Trash2 } from 'lucide-react';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function DoctorSchedulePage() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });

  const load = async () => {
    const { data } = await supabase
      .from('DoctorSchedule')
      .select('*')
      .eq('doctorId', user?.id)
      .order('dayOfWeek')
      .order('startTime');
    setSchedule(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.startTime >= form.endTime) { setError('Start time must be before end time.'); return; }
    setSaving(true);
    setError('');
    const { error: insertError } = await supabase.from('DoctorSchedule').insert({
      hospitalId: user?.hospitalId,
      doctorId: user?.id,
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
    });
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    await load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('DoctorSchedule').delete().eq('id', id);
    await load();
  };

  if (user?.role !== 'DOCTOR') {
    return <div className="text-gray-500">This page is only available to doctors.</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-7 h-7 text-indigo-600" />My Schedule
        </h1>
        <p className="text-gray-500 mt-2">Set the days and hours you're available for appointments. Patients and staff will only be able to book you during these windows.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Add Working Hours</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })} className="px-4 py-3 rounded-lg border border-gray-300">
            {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300" />
          <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="px-4 py-3 rounded-lg border border-gray-300" />
        </div>
        <Button type="submit" disabled={saving} className="gap-2"><Plus className="w-4 h-4" />{saving ? 'Adding...' : 'Add Hours'}</Button>
      </form>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Weekly Schedule</h3>
        </div>
        {loading ? (
          <p className="text-gray-500 p-6">Loading…</p>
        ) : schedule.length === 0 ? (
          <p className="text-gray-500 p-6">No working hours set yet — add some above. Until then, a default 9am–5pm window is used for booking.</p>
        ) : (
          <div className="divide-y">
            {schedule.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{DAYS.find((d) => d.value === s.dayOfWeek)?.label}</p>
                  <p className="text-sm text-gray-500">{s.startTime} – {s.endTime}</p>
                </div>
                <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
