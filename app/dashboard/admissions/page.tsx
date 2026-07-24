'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { canManageBeds, isAdmin } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BedDouble, Settings2 } from 'lucide-react';

export default function AdmissionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [wards, setWards] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [wardsRes, admissionsRes] = await Promise.all([
        supabase.from('Ward').select('*, Bed(*)').order('name'),
        supabase.from('Admission').select('*, Patient(fullName, mrn), User(fullName), Bed(bedNumber, Ward(name))').order('admittedAt', { ascending: false }),
      ]);
      setWards(wardsRes.data || []);
      setAdmissions(admissionsRes.data || []);
      setLoading(false);
    })();
  }, []);

  const bedStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200';
      case 'OCCUPIED': return 'bg-red-500/20 border-red-400/50 text-red-200';
      case 'RESERVED': return 'bg-amber-500/20 border-amber-400/50 text-amber-200';
      case 'CLEANING': return 'bg-blue-500/20 border-blue-400/50 text-blue-200';
      default: return 'bg-gray-500/20 border-gray-400/50 text-gray-300';
    }
  };

  const admissionStatusColor = (status: string) => {
    switch (status) {
      case 'ADMITTED': return 'bg-blue-100 text-blue-800';
      case 'DISCHARGED': return 'bg-green-100 text-green-800';
      case 'TRANSFERRED': return 'bg-amber-100 text-amber-800';
      case 'DECEASED': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBeds = wards.reduce((sum, w) => sum + (w.Bed?.length || 0), 0);
  const occupiedBeds = wards.reduce((sum, w) => sum + (w.Bed || []).filter((b: any) => b.status === 'OCCUPIED').length, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold heading-gradient">Admissions & Beds</h1>
          <p className="text-gray-400 mt-2">Ward occupancy and inpatient admissions</p>
        </div>
        <div className="flex gap-2">
          {isAdmin(user?.role) && (
            <Link href="/dashboard/admissions/beds">
              <Button variant="outline" className="gap-2"><Settings2 className="w-4 h-4" />Manage Beds & Rooms</Button>
            </Link>
          )}
          {canManageBeds(user?.role) && (
            <Link href="/dashboard/admissions/new">
              <Button className="gap-2 gradient-primary"><Plus className="w-4 h-4" />New Admission</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><BedDouble className="w-5 h-5 text-cyan-400" />Bed Board</h2>
          <p className="text-sm text-gray-400">{occupiedBeds} / {totalBeds} beds occupied</p>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-5">
            {wards.map((ward) => (
              <div key={ward.id}>
                <p className="text-sm font-semibold text-gray-300 mb-2">{ward.name} {ward.wardType ? `— ${ward.wardType}` : ''} {ward.floor ? `(Floor ${ward.floor})` : ''}</p>
                <div className="flex flex-wrap gap-2">
                  {(ward.Bed || []).map((bed: any) => (
                    <div key={bed.id} className={`px-3 py-2 rounded-lg border text-xs font-semibold ${bedStatusColor(bed.status)}`}>
                      {bed.bedNumber}
                      <span className="block text-[10px] opacity-70 font-normal">{bed.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Admissions</h2>
        </div>
        {loading ? (
          <p className="text-gray-400 p-6">Loading…</p>
        ) : admissions.length === 0 ? (
          <p className="text-gray-400 p-6">No admissions yet</p>
        ) : (
          <div className="divide-y divide-white/10">
            {admissions.map((adm) => (
              <div key={adm.id} onClick={() => router.push(`/dashboard/admissions/${adm.id}`)} className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
                <div>
                  <p className="text-white font-medium">{adm.Patient?.fullName} <span className="text-gray-400 text-xs">({adm.Patient?.mrn})</span></p>
                  <p className="text-xs text-gray-400">Dr. {adm.User?.fullName} • {adm.Bed?.Ward?.name} Bed {adm.Bed?.bedNumber} • {new Date(adm.admittedAt).toLocaleDateString()}</p>
                </div>
                <Badge className={admissionStatusColor(adm.status)}>{adm.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
