'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export default function DoctorMessagesPage() {
  const { user } = useAuth();
  const [messagingEnabled, setMessagingEnabled] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setMessagingEnabled(!!user.messagingEnabled);
    const { data } = await supabase
      .from('Message')
      .select('patientId, body, createdAt, senderRole, Patient(fullName, mrn)')
      .eq('doctorId', user.id)
      .order('createdAt', { ascending: false });

    // Collapse to most recent message per patient
    const seen = new Set<string>();
    const latest: any[] = [];
    for (const m of data || []) {
      if (!seen.has(m.patientId)) {
        seen.add(m.patientId);
        latest.push(m);
      }
    }
    setConversations(latest);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const toggleMessaging = async () => {
    if (!user) return;
    setSaving(true);
    const next = !messagingEnabled;
    await supabase.from('User').update({ messagingEnabled: next }).eq('id', user.id);
    setMessagingEnabled(next);
    setSaving(false);
  };

  if (user?.role !== 'DOCTOR') {
    return <div className="text-gray-500">Messaging is only available for doctor accounts.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Messages</h1>
          <p className="text-gray-500 mt-2">Conversations with your patients via the portal</p>
        </div>
        <label className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-gray-700">Accept patient messages</span>
          <button
            onClick={toggleMessaging}
            disabled={saving}
            className={`w-11 h-6 rounded-full transition-colors relative ${messagingEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${messagingEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>
      </div>

      {!messagingEnabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Messaging is currently off — patients won't see you in their portal's message list until you enable it above.
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden">
        {loading ? (
          <p className="text-gray-500 p-6">Loading…</p>
        ) : conversations.length === 0 ? (
          <p className="text-gray-500 p-6">No conversations yet</p>
        ) : (
          <div className="divide-y">
            {conversations.map((c) => (
              <Link key={c.patientId} href={`/dashboard/messages/${c.patientId}`} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{c.Patient?.fullName}</p>
                    <p className="text-sm text-gray-500 truncate max-w-md">{c.senderRole === 'DOCTOR' ? 'You: ' : ''}{c.body}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
