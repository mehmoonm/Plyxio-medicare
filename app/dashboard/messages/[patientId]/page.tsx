'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';

export default function DoctorConversationPage() {
  const params = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!user) return;
    const [p, msgs] = await Promise.all([
      supabase.from('Patient').select('fullName, mrn').eq('id', params.patientId).single(),
      supabase.from('Message').select('*').eq('patientId', params.patientId).eq('doctorId', user.id).order('createdAt', { ascending: true }),
    ]);
    setPatient(p.data);
    setMessages(msgs.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, params.patientId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim()) return;
    setSending(true);
    await supabase.from('Message').insert({
      hospitalId: user.hospitalId,
      patientId: params.patientId,
      doctorId: user.id,
      senderRole: 'DOCTOR',
      body: body.trim(),
    });
    setSending(false);
    setBody('');
    await load();
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient?.fullName}</h1>
          <p className="text-sm text-gray-500">MRN: {patient?.mrn}</p>
        </div>
        <Link href="/dashboard/messages"><Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
      </div>

      <div className="bg-white rounded-2xl border p-6 flex-1 overflow-y-auto space-y-3 min-h-[300px]">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm">No messages yet</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderRole === 'DOCTOR' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md rounded-2xl px-4 py-2 text-sm ${m.senderRole === 'DOCTOR' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {m.body}
                <p className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a reply…" className="flex-1 px-4 py-3 rounded-lg border border-gray-300" />
        <Button type="submit" disabled={sending} className="gap-2"><Send className="w-4 h-4" /></Button>
      </form>
    </div>
  );
}
