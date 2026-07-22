'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePatientAuth } from '@/lib/patient-auth-context';
import { supabase } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

export default function PortalBillingPage() {
  const { patient } = usePatientAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient) return;
    (async () => {
      const { data } = await supabase.from('Invoice').select('*').eq('patientId', patient.id).order('createdAt', { ascending: false });
      setInvoices(data || []);
      setLoading(false);
    })();
  }, [patient]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PARTIALLY_PAID': return 'bg-yellow-100 text-yellow-800';
      case 'UNPAID': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Billing</h1>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-gray-400 p-6">Loading…</p>
        ) : invoices.length === 0 ? (
          <p className="text-gray-400 p-6">No invoices yet</p>
        ) : (
          <div className="divide-y divide-white/10">
            {invoices.map((inv) => (
              <Link key={inv.id} href={`/portal/billing/${inv.id}`} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-white font-medium">{inv.invoiceNo}</p>
                  <p className="text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-white font-semibold">Rs {Number(inv.total).toLocaleString()}</p>
                  <Badge className={getStatusColor(inv.status)}>{inv.status.replace('_', ' ')}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
