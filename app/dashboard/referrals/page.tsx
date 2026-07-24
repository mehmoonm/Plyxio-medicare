'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { canManageReferrals } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Plus } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  DECLINED: 'bg-red-100 text-red-800',
};

export default function ReferralsPage() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('Referral')
        .select('*, Patient(fullName, mrn), referringDoctor:referringDoctorId(fullName), referredToDoctor:referredToDoctorId(fullName)')
        .order('createdAt', { ascending: false });
      setReferrals(data || []);
      setLoading(false);
    })();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === 'COMPLETED') updates.completedAt = new Date().toISOString();
    await supabase.from('Referral').update(updates).eq('id', id);
    setReferrals((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold heading-gradient flex items-center gap-2">
            <Share2 className="w-7 h-7 text-indigo-300" />Referrals
          </h1>
          <p className="text-gray-400 mt-2">Patients referred to other doctors, specialists, or hospitals</p>
        </div>
        {canManageReferrals(user?.role) && (
          <Link href="/dashboard/referrals/new">
            <Button className="gap-2 gradient-primary"><Plus className="w-4 h-4" />New Referral</Button>
          </Link>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-gray-400 p-6">Loading…</p>
        ) : referrals.length === 0 ? (
          <p className="text-gray-400 p-6">No referrals yet</p>
        ) : (
          <div className="divide-y divide-white/10">
            {referrals.map((r) => (
              <div key={r.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{r.Patient?.fullName} <span className="text-gray-400 text-xs">({r.Patient?.mrn})</span></p>
                    <p className="text-xs text-gray-400">
                      Referred by Dr. {r.referringDoctor?.fullName} to {r.referredToDoctor ? `Dr. ${r.referredToDoctor.fullName}` : r.referredToExternal || 'external provider'}
                      {r.specialty ? ` • ${r.specialty}` : ''}
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS[r.status]}>{r.status}</Badge>
                </div>
                <p className="text-sm text-gray-300">{r.reason}</p>
                {canManageReferrals(user?.role) && r.status !== 'COMPLETED' && r.status !== 'DECLINED' && (
                  <div className="flex gap-2 pt-1">
                    {r.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'ACCEPTED')}>Mark Accepted</Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'DECLINED')} className="text-red-400 border-red-400/50">Decline</Button>
                      </>
                    )}
                    {r.status === 'ACCEPTED' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'COMPLETED')}>Mark Completed</Button>
                    )}
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
