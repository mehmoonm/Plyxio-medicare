'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/lib/settings-context';
import { currencySymbol } from '@/lib/currency';
import { canManageRadiologyCatalog } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Scan, Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export default function RadiologyCatalogPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const currency = currencySymbol(settings.currency);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', bodyPartDefault: '', price: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', bodyPartDefault: '', price: '' });

  const load = async () => {
    const { data } = await supabase.from('RadiologyTestCatalog').select('*').order('name');
    setTests(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Test name is required.'); return; }
    setSaving(true);
    setError('');
    const { error: insertError } = await supabase.from('RadiologyTestCatalog').insert({
      hospitalId: user?.hospitalId,
      name: form.name.trim(),
      bodyPartDefault: form.bodyPartDefault || null,
      price: form.price ? Number(form.price) : null,
    });
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    setForm({ name: '', bodyPartDefault: '', price: '' });
    setShowForm(false);
    await load();
  };

  const startEdit = (test: any) => {
    setEditingId(test.id);
    setEditForm({
      name: test.name,
      bodyPartDefault: test.bodyPartDefault || '',
      price: test.price != null ? String(test.price) : '',
    });
  };

  const saveEdit = async (id: string) => {
    if (!editForm.name.trim()) { setError('Test name is required.'); return; }
    setError('');
    const { error: updateError } = await supabase.from('RadiologyTestCatalog').update({
      name: editForm.name.trim(),
      bodyPartDefault: editForm.bodyPartDefault || null,
      price: editForm.price ? Number(editForm.price) : null,
    }).eq('id', id);
    if (updateError) { setError(updateError.message); return; }
    setEditingId(null);
    await load();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from('RadiologyTestCatalog').update({ isActive: !isActive }).eq('id', id);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this test from the catalog? Existing radiology orders that already used it are unaffected.')) return;
    const { error: deleteError } = await supabase.from('RadiologyTestCatalog').delete().eq('id', id);
    if (deleteError) { setError(deleteError.message); return; }
    await load();
  };

  if (!canManageRadiologyCatalog(user?.role)) {
    return <div className="text-gray-400">This page is only available to admins and radiologists.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold heading-gradient flex items-center gap-2">
            <Scan className="w-7 h-7 text-indigo-300" />Radiology Test Catalog
          </h1>
          <p className="text-gray-400 mt-2">Manage the imaging studies available for ordering, and their prices</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/radiology">
            <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Radiology</Button>
          </Link>
          <Button onClick={() => setShowForm((v) => !v)} className="gap-2 gradient-primary"><Plus className="w-4 h-4" />Add Test</Button>
        </div>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleAdd} className="glass-card rounded-2xl p-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Test name (e.g. CT Scan)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white" />
            <Input placeholder="Default body part (optional)" value={form.bodyPartDefault} onChange={(e) => setForm({ ...form, bodyPartDefault: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white" />
            <Input type="number" min={0} placeholder={`Price (${currency})`} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="glass-input px-4 py-3 rounded-lg text-white" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="gradient-primary">{saving ? 'Saving...' : 'Save Test'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-gray-400 p-6">Loading…</p>
        ) : tests.length === 0 ? (
          <p className="text-gray-400 p-6">No tests in the catalog yet — add one above.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {tests.map((t) => (
              <div key={t.id} className="p-4">
                {editingId === t.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input placeholder="Test name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm" />
                      <Input placeholder="Default body part" value={editForm.bodyPartDefault} onChange={(e) => setEditForm({ ...editForm, bodyPartDefault: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm" />
                      <Input type="number" min={0} placeholder={`Price (${currency})`} value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="glass-input px-3 py-2 rounded-lg text-white text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(t.id)} className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${t.isActive ? 'text-white' : 'text-gray-500 line-through'}`}>{t.name}</p>
                      <p className="text-xs text-gray-400">{t.bodyPartDefault || 'No default body part'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-white font-semibold">{t.price != null ? `${currency} ${Number(t.price).toLocaleString()}` : '—'}</p>
                      <button onClick={() => toggleActive(t.id, t.isActive)} className={`text-xs px-2 py-1 rounded-lg ${t.isActive ? 'bg-emerald-600/30 text-emerald-300' : 'bg-gray-600/30 text-gray-400'}`}>
                        {t.isActive ? 'Active' : 'Hidden'}
                      </button>
                      <button onClick={() => startEdit(t)} className="p-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
