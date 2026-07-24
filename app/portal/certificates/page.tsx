'use client';

import { useEffect, useState } from 'react';
import { usePatientAuth } from '@/lib/patient-auth-context';
import { supabase } from '@/lib/supabase/client';
import { generateMedicalCertificatePdf, printMedicalCertificatePdf } from '@/lib/pdf/medical-certificate-pdf';
import { Button } from '@/components/ui/button';
import { Download, Printer, FileCheck } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  SICK_LEAVE: 'Sick Leave',
  FITNESS: 'Fitness Certificate',
  OTHER: 'Certificate',
};

export default function PortalCertificatesPage() {
  const { patient } = usePatientAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient) return;
    (async () => {
      const { data } = await supabase
        .from('MedicalCertificate')
        .select('*, User(fullName, specialty)')
        .eq('patientId', patient.id)
        .order('createdAt', { ascending: false });
      setCertificates(data || []);
      setLoading(false);
    })();
  }, [patient]);

  useEffect(() => {
    if (!patient?.hospitalId) return;
    (async () => {
      const { data } = await supabase.from('Hospital').select('name, logoUrl, phone, email, address, city').eq('id', patient.hospitalId).single();
      setHospital(data);
    })();
  }, [patient?.hospitalId]);

  const buildPdfData = (cert: any) => ({
    hospitalName: hospital?.name || 'PLYXIO Vitals',
    hospitalLogo: hospital?.logoUrl,
    hospitalPhone: hospital?.phone,
    hospitalEmail: hospital?.email,
    hospitalAddress: hospital?.address,
    hospitalCity: hospital?.city,
    patientName: patient?.fullName || 'Unknown',
    patientMrn: patient?.mrn || '',
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
      <h1 className="text-3xl font-bold text-white flex items-center gap-2"><FileCheck className="w-7 h-7 text-indigo-300" />Medical Certificates</h1>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : certificates.length === 0 ? (
        <div className="glass-card rounded-2xl p-6"><p className="text-gray-400">No certificates issued yet</p></div>
      ) : (
        <div className="space-y-4">
          {certificates.map((c) => (
            <div key={c.id} className="glass-card rounded-2xl p-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-white font-semibold">{TYPE_LABELS[c.type] || c.type}</p>
                <p className="text-xs text-gray-400">
                  {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()} • Dr. {c.User?.fullName}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => printMedicalCertificatePdf(buildPdfData(c))} variant="outline" size="sm" className="gap-2"><Printer className="w-4 h-4" />Print</Button>
                <Button onClick={() => generateMedicalCertificatePdf(buildPdfData(c))} variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" />PDF</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
