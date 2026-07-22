'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePatientAuth } from '@/lib/patient-auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';

export default function PortalConversationPage() {
  const params = useParams<{ doctorId: string }>();
  const { patient } = usePatientAuth();
  const [doctor, setDoctor] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!patient) return;
    const [d, msgs] = await Promise.all([
      supabase.from('User').select('id, fullName, specialty, messagingEnabled').eq('id', params.doctorId).single(),
      supabase.from('Message').select('*').eq('patientId', patient.id).eq('doctorId', params.doctorId).order('createdAt', { ascending: true }),
    ]);
    setDoctor(d.data);
    setMessages(msgs.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [patient, params.doctorId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !body.trim()) return;
    setSending(true);
    setError('');
    const { error: sendError } = await supabase.from('Message').insert({
      hospitalId: patient.hospitalId,
      patientId: patient.id,
      doctorId: params.doctorId,
      senderRole: 'PATIENT',
      body: body.trim(),
    });
    setSending(false);
    if (sendError) { setError(sendError.message); return; }
    setBody('');
    await load();
  };

  if (loading) return <p className="text-gray-400">Loading…</p>;

  if (!doctor?.messagingEnabled) {
    return (
      <div className="space-y-6">
        <Link href="/portal/messages"><Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
        <div className="glass-card rounded-2xl p-6"><p className="text-gray-400">This doctor isn't accepting messages right now.</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dr. {doctor.fullName}</h1>
          <p className="text-sm text-gray-400">{doctor.specialty}</p>
        </div>
        <Link href="/portal/messages"><Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
      </div>

      <div className="glass-card rounded-2xl p-6 flex-1 overflow-y-auto space-y-3 min-h-[300px]">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm">No messages yet — say hello.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderRole === 'PATIENT' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md rounded-2xl px-4 py-2 text-sm ${m.senderRole === 'PATIENT' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-200'}`}>
                {m.body}
                <p className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          className="glass-input flex-1 px-4 py-3 rounded-lg text-white"
        />
        <Button type="submit" disabled={sending} className="gap-2 gradient-primary"><Send className="w-4 h-4" /></Button>
      </form>
    </div>
  );
}
