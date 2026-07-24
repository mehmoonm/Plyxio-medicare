'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePatientAuth } from '@/lib/patient-auth-context';
import { supabase } from '@/lib/supabase/client';
import { Calendar, Receipt, Pill } from 'lucide-react';
import { currencySymbol } from '@/lib/currency';

export default function PortalDashboard() {
  const { patient } = usePatientAuth();
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [rxCount, setRxCount] = useState(0);
  const [currency, setCurrency] = useState('Rs');

  useEffect(() => {
    if (!patient?.hospitalId) return;
    (async () => {
      const { data } = await supabase.from('Hospital').select('currency').eq('id', patient.hospitalId).single();
      if (data?.currency) setCurrency(currencySymbol(data.currency));
    })();
  }, [patient?.hospitalId]);

  useEffect(() => {
    if (!patient) return;
    (async () => {
      const [apts, invoices, rx] = await Promise.all([
        supabase.from('Appointment').select('*, User(fullName)').eq('patientId', patient.id).eq('status', 'SCHEDULED').order('scheduledAt', { ascending: true }).limit(5),
        supabase.from('Invoice').select('total, amountPaid').eq('patientId', patient.id).in('status', ['UNPAID', 'PARTIALLY_PAID']),
        supabase.from('Encounter').select('id, Prescription(id)').eq('patientId', patient.id),
      ]);
      setUpcoming(apts.data || []);
      setBalance((invoices.data || []).reduce((s: number, i: any) => s + (Number(i.total) - Number(i.amountPaid)), 0));
      setRxCount((rx.data || []).filter((e: any) => e.Prescription?.length > 0).length);
    })();
  }, [patient]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Welcome, {patient?.fullName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/portal/appointments" className="glass-card rounded-2xl p-6 hover:border-white/40 transition-all">
          <Calendar className="w-8 h-8 text-cyan-400 mb-3" />
          <p className="text-gray-300 text-sm">Upcoming Appointments</p>
          <p className="text-3xl font-bold text-white mt-1">{upcoming.length}</p>
        </Link>
        <Link href="/portal/billing" className="glass-card rounded-2xl p-6 hover:border-white/40 transition-all">
          <Receipt className="w-8 h-8 text-amber-400 mb-3" />
          <p className="text-gray-300 text-sm">Outstanding Balance</p>
          <p className="text-3xl font-bold text-white mt-1">{currency} {balance.toLocaleString()}</p>
        </Link>
        <Link href="/portal/prescriptions" className="glass-card rounded-2xl p-6 hover:border-white/40 transition-all">
          <Pill className="w-8 h-8 text-emerald-400 mb-3" />
          <p className="text-gray-300 text-sm">Active Prescriptions</p>
          <p className="text-3xl font-bold text-white mt-1">{rxCount}</p>
        </Link>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Upcoming Appointments</h2>
          <Link href="/portal/appointments/new" className="text-sm text-indigo-300 hover:text-indigo-200">+ Book new</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-gray-400 text-sm">No upcoming appointments</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((apt) => (
              <div key={apt.id} className="bg-white/5 rounded-lg px-4 py-3 flex justify-between">
                <div>
                  <p className="text-white font-medium">Dr. {apt.User?.fullName}</p>
                  <p className="text-xs text-gray-400">{apt.reason}</p>
                </div>
                <p className="text-sm text-gray-300">{new Date(apt.scheduledAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
