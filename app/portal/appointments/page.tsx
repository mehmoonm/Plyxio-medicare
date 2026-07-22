'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePatientAuth } from '@/lib/patient-auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

export default function PortalAppointmentsPage() {
  const { patient } = usePatientAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient) return;
    (async () => {
      const { data } = await supabase.from('Appointment').select('*, User(fullName, specialty)').eq('patientId', patient.id).order('scheduledAt', { ascending: false });
      setAppointments(data || []);
      setLoading(false);
    })();
  }, [patient]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'CHECKED_IN': case 'IN_CONSULTATION': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': case 'NO_SHOW': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Appointments</h1>
        <Link href="/portal/appointments/new">
          <Button className="gap-2"><Plus className="w-4 h-4" />Book Appointment</Button>
        </Link>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-gray-400 p-6">Loading…</p>
        ) : appointments.length === 0 ? (
          <p className="text-gray-400 p-6">No appointments yet</p>
        ) : (
          <div className="divide-y divide-white/10">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Dr. {apt.User?.fullName} <span className="text-gray-400 text-sm">— {apt.User?.specialty}</span></p>
                  <p className="text-sm text-gray-400">{new Date(apt.scheduledAt).toLocaleString()}</p>
                  {apt.reason && <p className="text-xs text-gray-500 mt-1">{apt.reason}</p>}
                </div>
                <Badge className={getStatusColor(apt.status)}>{apt.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
