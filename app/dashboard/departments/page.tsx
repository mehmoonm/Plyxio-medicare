'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { canManageDepartments } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Plus, Trash2, Pencil, Check, X } from 'lucide-react';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [staffCounts, setStaffCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await supabase.from('Department').select('*').order('name');
    setDepartments(data || []);

    const { data: staff } = await supabase.from('User').select('departmentId').not('departmentId', 'is', null);
    const counts: Record<string, number> = {};
    for (const s of staff || []) {
      if (s.departmentId) counts[s.departmentId] = (counts[s.departmentId] || 0) + 1;
    }
    setStaffCounts(counts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError('');
    const { error: insertError } = await supabase.from('Department').insert({
      hospitalId: user?.hospitalId,
      name: newName.trim(),
    });
    setAdding(false);
    if (insertError) { setError(insertError.message); return; }
    setNewName('');
    await load();
  };

  const startEdit = (dept: any) => {
    setEditingId(dept.id);
    setEditName(dept.name);
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const { error: updateError } = await supabase.from('Department').update({ name: editName.trim() }).eq('id', id);
    if (updateError) { setError(updateError.message); return; }
    setEditingId(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    const { error: deleteError } = await supabase.from('Department').delete().eq('id', id);
    if (deleteError) { setError(deleteError.message); return; }
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold heading-gradient flex items-center gap-2">
          <Building2 className="w-8 h-8 text-indigo-300" />Departments
        </h1>
        <p className="text-gray-400 mt-2">Organize your hospital into clinical/administrative departments</p>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}

      {canManageDepartments(user?.role) && (
        <form onSubmit={handleAdd} className="glass-card rounded-2xl p-4 flex gap-2">
          <Input placeholder="New department name (e.g. Cardiology)" value={newName} onChange={(e) => setNewName(e.target.value)} className="glass-input flex-1 px-4 py-3 rounded-lg text-white" />
          <Button type="submit" disabled={adding} className="gap-2 gradient-primary"><Plus className="w-4 h-4" />Add</Button>
        </form>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-gray-400 p-6">Loading…</p>
        ) : departments.length === 0 ? (
          <p className="text-gray-400 p-6">No departments yet — add one above.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 flex items-center justify-between">
                {editingId === dept.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="glass-input px-3 py-2 rounded-lg text-white flex-1" autoFocus />
                    <button onClick={() => saveEdit(dept.id)} className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-white font-medium">{dept.name}</p>
                      <p className="text-xs text-gray-400">{staffCounts[dept.id] || 0} staff assigned</p>
                    </div>
                    {canManageDepartments(user?.role) && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(dept)} className="p-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(dept.id)} className="p-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
