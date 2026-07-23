'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, CheckCircle2, Ban, Play } from 'lucide-react';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || `hospital-${Date.now().toString().slice(-6)}`;
}

const STATUS_COLORS: Record<string, string> = {
  TRIAL: 'bg-blue-100 text-blue-800',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-200 text-gray-700',
};

export default function PlatformAdminPage() {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ hospitalName: '', adminName: '', adminEmail: '', paymentMethod: 'CASH', alreadyPaid: true });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('Hospital').select('*').order('createdAt', { ascending: false });
    setHospitals(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (hospitalId: string, status: string) => {
    setBusy(hospitalId);
    const updates: any = { subscriptionStatus: status };
    if (status === 'ACTIVE') {
      updates.approvedAt = new Date().toISOString();
      updates.approvedById = user?.id;
    }
    await supabase.from('Hospital').update(updates).eq('id', hospitalId);
    await load();
    setBusy(null);
  };

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.hospitalName.trim() || !addForm.adminEmail.trim() || !addForm.adminName.trim()) {
      setError('Fill in hospital name, admin name, and admin email.');
      return;
    }
    setSaving(true);
    setError('');

    const { error: insertError } = await supabase.from('Hospital').insert({
      name: addForm.hospitalName.trim(),
      slug: slugify(addForm.hospitalName),
      subscriptionStatus: addForm.alreadyPaid ? 'ACTIVE' : 'PENDING_APPROVAL',
      paymentMethod: addForm.paymentMethod,
      pendingAdminEmail: addForm.adminEmail.trim(),
      pendingAdminName: addForm.adminName.trim(),
      approvedAt: addForm.alreadyPaid ? new Date().toISOString() : null,
      approvedById: addForm.alreadyPaid ? user?.id : null,
    });

    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    setAddForm({ hospitalName: '', adminName: '', adminEmail: '', paymentMethod: 'CASH', alreadyPaid: true });
    setShowAddForm(false);
    await load();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold heading-gradient flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-300" />Hospital Accounts
          </h1>
          <p className="text-gray-400 mt-2">Every hospital using PLYXIO Vitals, across the whole platform</p>
        </div>
        <Button onClick={() => setShowAddForm((v) => !v)} className="gap-2 gradient-primary"><Plus className="w-4 h-4" />Add Hospital Manually</Button>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}

      {showAddForm && (
        <form onSubmit={handleAddHospital} className="glass-card rounded-2xl p-6 space-y-3">
          <h3 className="font-semibold text-white">Manually Add a Hospital (cash / offline payment)</h3>
          <p className="text-xs text-gray-400">
            Creates the hospital account. The admin you name below will finish setup themselves by signing up at{' '}
            <span className="text-indigo-300">/signup</span> with this same email — it'll automatically link to this account instead of creating a duplicate.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Hospital name" value={addForm.hospitalName} onChange={(e) => setAddForm({ ...addForm, hospitalName: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white" />
            <Input placeholder="Admin's full name" value={addForm.adminName} onChange={(e) => setAddForm({ ...addForm, adminName: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white" />
            <Input type="email" placeholder="Admin's email" value={addForm.adminEmail} onChange={(e) => setAddForm({ ...addForm, adminEmail: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white" />
            <select value={addForm.paymentMethod} onChange={(e) => setAddForm({ ...addForm, paymentMethod: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white">
              <option value="CASH" className="text-black">Cash</option>
              <option value="BANK_TRANSFER" className="text-black">Bank Transfer</option>
              <option value="OTHER" className="text-black">Other / Offline</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={addForm.alreadyPaid} onChange={(e) => setAddForm({ ...addForm, alreadyPaid: e.target.checked })} className="w-4 h-4" />
            Payment already received — activate immediately
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="gradient-primary">{saving ? 'Creating...' : 'Create Hospital'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-gray-400 p-6">Loading…</p>
        ) : hospitals.length === 0 ? (
          <p className="text-gray-400 p-6">No hospitals yet</p>
        ) : (
          <div className="divide-y divide-white/10">
            {hospitals.map((h) => (
              <div key={h.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{h.name}</p>
                  <p className="text-xs text-gray-400">
                    /{h.slug} • {h.pendingAdminEmail ? `Pending admin: ${h.pendingAdminEmail}` : `${h.paymentMethod || 'No payment method set'}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={STATUS_COLORS[h.subscriptionStatus] || 'bg-gray-100 text-gray-800'}>{h.subscriptionStatus?.replace('_', ' ')}</Badge>
                  {h.subscriptionStatus !== 'ACTIVE' && (
                    <button onClick={() => updateStatus(h.id, 'ACTIVE')} disabled={busy === h.id} className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300" title="Approve / Activate">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {h.subscriptionStatus !== 'SUSPENDED' && h.subscriptionStatus === 'ACTIVE' && (
                    <button onClick={() => updateStatus(h.id, 'SUSPENDED')} disabled={busy === h.id} className="p-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300" title="Suspend">
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  {h.subscriptionStatus === 'SUSPENDED' && (
                    <button onClick={() => updateStatus(h.id, 'ACTIVE')} disabled={busy === h.id} className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300" title="Reactivate">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
