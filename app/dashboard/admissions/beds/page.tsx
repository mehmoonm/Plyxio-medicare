'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/lib/settings-context';
import { currencySymbol } from '@/lib/currency';
import { isAdmin } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, BedDouble, Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const BED_STATUSES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'];
const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-800',
  OCCUPIED: 'bg-red-100 text-red-800',
  MAINTENANCE: 'bg-amber-100 text-amber-800',
  RESERVED: 'bg-blue-100 text-blue-800',
};

export default function BedsAndRoomsPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const currency = currencySymbol(settings.currency);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedWard, setExpandedWard] = useState<string | null>(null);

  const [showWardForm, setShowWardForm] = useState(false);
  const [wardForm, setWardForm] = useState({ name: '', wardType: '', floor: '' });
  const [editingWardId, setEditingWardId] = useState<string | null>(null);
  const [editWardForm, setEditWardForm] = useState({ name: '', wardType: '', floor: '' });

  const [showBedForm, setShowBedForm] = useState<string | null>(null);
  const [bedForm, setBedForm] = useState({ bedNumber: '', dailyRate: '' });
  const [editingBedId, setEditingBedId] = useState<string | null>(null);
  const [editBedForm, setEditBedForm] = useState({ bedNumber: '', dailyRate: '', status: 'AVAILABLE' });

  const load = async () => {
    const { data } = await supabase.from('Ward').select('*, Bed(*)').order('floor').order('name');
    setWards(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAddWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardForm.name.trim()) { setError('Room/ward name is required.'); return; }
    setError('');
    const { error: insertError } = await supabase.from('Ward').insert({
      hospitalId: user?.hospitalId,
      name: wardForm.name.trim(),
      wardType: wardForm.wardType || null,
      floor: wardForm.floor || null,
    });
    if (insertError) { setError(insertError.message); return; }
    setWardForm({ name: '', wardType: '', floor: '' });
    setShowWardForm(false);
    await load();
  };

  const startEditWard = (ward: any) => {
    setEditingWardId(ward.id);
    setEditWardForm({ name: ward.name, wardType: ward.wardType || '', floor: ward.floor || '' });
  };

  const saveEditWard = async (id: string) => {
    if (!editWardForm.name.trim()) { setError('Room/ward name is required.'); return; }
    const { error: updateError } = await supabase.from('Ward').update({
      name: editWardForm.name.trim(),
      wardType: editWardForm.wardType || null,
      floor: editWardForm.floor || null,
    }).eq('id', id);
    if (updateError) { setError(updateError.message); return; }
    setEditingWardId(null);
    await load();
  };

  const handleDeleteWard = async (id: string) => {
    if (!confirm("Delete this room/ward and all its beds? This can't be undone. Wards with admission history can't be deleted.")) return;
    const { error: deleteError } = await supabase.from('Ward').delete().eq('id', id);
    if (deleteError) { setError(deleteError.message); return; }
    await load();
  };

  const handleAddBed = async (e: React.FormEvent, wardId: string) => {
    e.preventDefault();
    if (!bedForm.bedNumber.trim()) { setError('Bed number is required.'); return; }
    setError('');
    const { error: insertError } = await supabase.from('Bed').insert({
      hospitalId: user?.hospitalId,
      wardId,
      bedNumber: bedForm.bedNumber.trim(),
      status: 'AVAILABLE',
      dailyRate: bedForm.dailyRate ? Number(bedForm.dailyRate) : null,
    });
    if (insertError) { setError(insertError.message); return; }
    setBedForm({ bedNumber: '', dailyRate: '' });
    setShowBedForm(null);
    await load();
  };

  const startEditBed = (bed: any) => {
    setEditingBedId(bed.id);
    setEditBedForm({ bedNumber: bed.bedNumber, dailyRate: bed.dailyRate != null ? String(bed.dailyRate) : '', status: bed.status });
  };

  const saveEditBed = async (id: string) => {
    const { error: updateError } = await supabase.from('Bed').update({
      bedNumber: editBedForm.bedNumber.trim(),
      dailyRate: editBedForm.dailyRate ? Number(editBedForm.dailyRate) : null,
      status: editBedForm.status,
    }).eq('id', id);
    if (updateError) { setError(updateError.message); return; }
    setEditingBedId(null);
    await load();
  };

  const handleDeleteBed = async (id: string) => {
    if (!confirm('Remove this bed?')) return;
    const { error: deleteError } = await supabase.from('Bed').delete().eq('id', id);
    if (deleteError) { setError(deleteError.message); return; }
    await load();
  };

  if (!isAdmin(user?.role)) {
    return <div className="text-gray-500">This page is only available to hospital admins.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold heading-gradient flex items-center gap-2">
            <BedDouble className="w-7 h-7 text-indigo-300" />Beds & Rooms
          </h1>
          <p className="text-gray-400 mt-2">Manage rooms/wards, floors, and individual beds</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admissions">
            <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Admissions</Button>
          </Link>
          <Button onClick={() => setShowWardForm((v) => !v)} className="gap-2 gradient-primary"><Plus className="w-4 h-4" />Add Room/Ward</Button>
        </div>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}

      {showWardForm && (
        <form onSubmit={handleAddWard} className="glass-card rounded-2xl p-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Room/Ward name (e.g. General Ward A)" value={wardForm.name} onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white" />
            <Input placeholder="Type (e.g. ICU, General, Private)" value={wardForm.wardType} onChange={(e) => setWardForm({ ...wardForm, wardType: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white" />
            <Input placeholder="Floor (e.g. 2nd Floor)" value={wardForm.floor} onChange={(e) => setWardForm({ ...wardForm, floor: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="gradient-primary">Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowWardForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : wards.length === 0 ? (
        <div className="glass-card rounded-2xl p-6"><p className="text-gray-400">No rooms/wards set up yet — add one above.</p></div>
      ) : (
        <div className="space-y-3">
          {wards.map((ward) => (
            <div key={ward.id} className="glass-card rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                {editingWardId === ward.id ? (
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <Input value={editWardForm.name} onChange={(e) => setEditWardForm({ ...editWardForm, name: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm w-40" />
                    <Input placeholder="Type" value={editWardForm.wardType} onChange={(e) => setEditWardForm({ ...editWardForm, wardType: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm w-32" />
                    <Input placeholder="Floor" value={editWardForm.floor} onChange={(e) => setEditWardForm({ ...editWardForm, floor: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm w-32" />
                    <button onClick={() => saveEditWard(ward.id)} className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingWardId(null)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button onClick={() => setExpandedWard(expandedWard === ward.id ? null : ward.id)} className="flex-1 flex items-center gap-3 text-left">
                    <div>
                      <p className="text-white font-semibold">{ward.name}</p>
                      <p className="text-xs text-gray-400">{ward.wardType || 'No type set'}{ward.floor ? ` · ${ward.floor}` : ''} · {(ward.Bed || []).length} bed{(ward.Bed || []).length === 1 ? '' : 's'}</p>
                    </div>
                  </button>
                )}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {editingWardId !== ward.id && (
                    <>
                      <button onClick={() => startEditWard(ward)} className="p-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteWard(ward.id)} className="p-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300"><Trash2 className="w-4 h-4" /></button>
                      <button onClick={() => setExpandedWard(expandedWard === ward.id ? null : ward.id)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300">
                        {expandedWard === ward.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {expandedWard === ward.id && (
                <div className="px-4 pb-4 bg-white/5 space-y-2">
                  <div className="flex justify-end pt-3">
                    <Button size="sm" onClick={() => setShowBedForm(showBedForm === ward.id ? null : ward.id)} className="gap-1 gradient-primary">
                      <Plus className="w-3.5 h-3.5" />Add Bed
                    </Button>
                  </div>

                  {showBedForm === ward.id && (
                    <form onSubmit={(e) => handleAddBed(e, ward.id)} className="flex flex-wrap gap-2 bg-white/5 rounded-lg p-3">
                      <Input placeholder="Bed number" value={bedForm.bedNumber} onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm w-32" />
                      <Input type="number" min={0} placeholder={`Daily rate (${currency})`} value={bedForm.dailyRate} onChange={(e) => setBedForm({ ...bedForm, dailyRate: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm w-40" />
                      <Button type="submit" size="sm" className="gradient-primary">Save</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowBedForm(null)}>Cancel</Button>
                    </form>
                  )}

                  {(ward.Bed || []).length === 0 ? (
                    <p className="text-gray-400 text-sm px-1">No beds in this room yet.</p>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {ward.Bed.map((bed: any) => (
                        <div key={bed.id} className="py-2.5 px-1 flex items-center justify-between">
                          {editingBedId === bed.id ? (
                            <div className="flex-1 flex flex-wrap items-center gap-2">
                              <Input value={editBedForm.bedNumber} onChange={(e) => setEditBedForm({ ...editBedForm, bedNumber: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm w-28" />
                              <Input type="number" min={0} value={editBedForm.dailyRate} onChange={(e) => setEditBedForm({ ...editBedForm, dailyRate: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm w-32" />
                              <select value={editBedForm.status} onChange={(e) => setEditBedForm({ ...editBedForm, status: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm">
                                {BED_STATUSES.map((s) => <option key={s} value={s} className="text-black">{s}</option>)}
                              </select>
                              <button onClick={() => saveEditBed(bed.id)} className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setEditingBedId(null)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <span className="text-white text-sm font-medium">Bed {bed.bedNumber}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[bed.status] || 'bg-gray-100 text-gray-800'}`}>{bed.status}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-300 text-sm">{bed.dailyRate != null ? `${currency} ${Number(bed.dailyRate).toLocaleString()}/day` : 'No rate set'}</span>
                                <button onClick={() => startEditBed(bed)} className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteBed(bed.id)} className="p-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
