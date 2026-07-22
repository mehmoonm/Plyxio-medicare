'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePatientAuth } from '@/lib/patient-auth-context';
import { supabase } from '@/lib/supabase/client';
import { MessageCircle } from 'lucide-react';

export default function PortalMessagesPage() {
  const { patient } = usePatientAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('User').select('id, fullName, specialty').eq('role', 'DOCTOR').eq('isActive', true).eq('messagingEnabled', true);
      setDoctors(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Messages</h1>
      <p className="text-gray-400 -mt-4 text-sm">Only doctors who've enabled messaging appear here.</p>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-gray-400 p-6">Loading…</p>
        ) : doctors.length === 0 ? (
          <p className="text-gray-400 p-6">No doctors currently have messaging enabled.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {doctors.map((d) => (
              <Link key={d.id} href={`/portal/messages/${d.id}`} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Dr. {d.fullName}</p>
                    <p className="text-xs text-gray-400">{d.specialty || 'General'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
