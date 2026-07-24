'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/lib/settings-context';
import { canManageMedicalCertificates } from '@/lib/permissions';
import { generateMedicalCertificatePdf, printMedicalCertificatePdf } from '@/lib/pdf/medical-certificate-pdf';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Plus, Download, Printer } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  SICK_LEAVE: 'Sick Leave',
  FITNESS: 'Fitness Certificate',
  OTHER: 'Other',
};

export default function MedicalCertificatesPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('MedicalCertificate')
        .select('*, Patient(fullName, mrn), User(fullName, specialty)')
        .order('createdAt', { ascending: false });
      setCertificates(data || []);
      setLoading(false);
    })();
  }, []);

  const buildPdfData = (cert: any) => ({
    hospitalName: settings.hospitalName,
    hospitalLogo: settings.logo,
    hospitalPhone: settings.phone,
    hospitalEmail: settings.email,
    hospitalAddress: settings.address,
    hospitalCity: settings.city,
    patientName: cert.Patient?.fullName || 'Unknown',
    patientMrn: cert.Patient?.mrn || '',
    doctorName: cert.User?.fullName || 'Unknown',
    doctorSpecialty: cert.User?.specialty,
    type: cert.type,
    startDate: cert.startDate,
    endDate: cert.endDate,
    reason: cert.reason,
    notes: cert.notes,
    issuedAt: cert.createdAt,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold heading-gradient flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-indigo-300" />Medical Certificates
          </h1>
          <p className="text-gray-400 mt-2">Sick leave and fitness certificates issued to patients</p>
        </div>
        {canManageMedicalCertificates(user?.role) && (
          <Link href="/dashboard/medical-certificates/new">
            <Button className="gap-2 gradient-primary"><Plus className="w-4 h-4" />New Certificate</Button>
          </Link>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-gray-400 p-6">Loading…</p>
        ) : certificates.length === 0 ? (
          <p className="text-gray-400 p-6">No certificates issued yet</p>
        ) : (
          <div className="divide-y divide-white/10">
            {certificates.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-white font-medium">{c.Patient?.fullName} <span className="text-gray-400 text-xs">({c.Patient?.mrn})</span></p>
                  <p className="text-xs text-gray-400">
                    {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()} • Dr. {c.User?.fullName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-100 text-indigo-800">{TYPE_LABELS[c.type] || c.type}</Badge>
                  <Button size="sm" variant="outline" onClick={() => printMedicalCertificatePdf(buildPdfData(c))} className="gap-1"><Printer className="w-3.5 h-3.5" />Print</Button>
                  <Button size="sm" variant="outline" onClick={() => generateMedicalCertificatePdf(buildPdfData(c))} className="gap-1"><Download className="w-3.5 h-3.5" />PDF</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
