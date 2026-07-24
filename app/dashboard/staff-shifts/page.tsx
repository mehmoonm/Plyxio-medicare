'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { isAdmin } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function StaffShiftsPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('User').select('id, fullName, role').neq('role', 'DOCTOR').eq('isActive', true).order('fullName');
      setStaff(data || []);
      setLoading(false);
    })();
  }, []);

  const loadShifts = async (staffId: string) => {
    const { data } = await supabase.from('StaffShift').select('*').eq('userId', staffId).order('dayOfWeek').order('startTime');
    setShifts(data || []);
  };

  useEffect(() => {
    if (selectedStaffId) loadShifts(selectedStaffId);
    else setShifts([]);
  }, [selectedStaffId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) { setError('Select a staff member first.'); return; }
    if (form.startTime >= form.endTime) { setError('Start time must be before end time.'); return; }
    setSaving(true);
    setError('');
    const { error: insertError } = await supabase.from('StaffShift').insert({
      hospitalId: user?.hospitalId,
      userId: selectedStaffId,
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
    });
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    await loadShifts(selectedStaffId);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('StaffShift').delete().eq('id', id);
    await loadShifts(selectedStaffId);
  };

  if (!isAdmin(user?.role)) {
    return <div className="text-gray-400">This page is only available to hospital admins.</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold heading-gradient flex items-center gap-2">
          <Clock className="w-7 h-7 text-indigo-300" />Staff Shifts
        </h1>
        <p className="text-gray-400 mt-2">Set weekly working hours for nurses, technicians, reception, and other staff. (Doctors manage their own schedule separately.)</p>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-300 block mb-2">Staff Member</label>
          <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)} className="glass-input w-full px-4 py-3 rounded-lg text-white">
            <option value="" className="text-black">Select a staff member</option>
            {staff.map((s) => <option key={s.id} value={s.id} className="text-black">{s.fullName} ({s.role.replace('_', ' ')})</option>)}
          </select>
        </div>

        {selectedStaffId && (
          <>
            {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
              <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })} className="glass-input px-3 py-2 rounded-lg text-white text-sm">
                {DAYS.map((d) => <option key={d.value} value={d.value} className="text-black">{d.label}</option>)}
              </select>
              <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm" />
              <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm" />
              <Button type="submit" disabled={saving} className="gap-1 gradient-primary"><Plus className="w-3.5 h-3.5" />Add</Button>
            </form>

            <div className="divide-y divide-white/10">
              {shifts.length === 0 ? (
                <p className="text-gray-400 text-sm py-3">No shifts set yet.</p>
              ) : (
                shifts.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{DAYS.find((d) => d.value === s.dayOfWeek)?.label}</p>
                      <p className="text-xs text-gray-400">{s.startTime} – {s.endTime}</p>
                    </div>
                    <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
