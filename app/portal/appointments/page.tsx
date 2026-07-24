'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePatientAuth } from '@/lib/patient-auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Star } from 'lucide-react';

export default function PortalAppointmentsPage() {
  const { patient } = usePatientAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [feedbackByAppointment, setFeedbackByAppointment] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [openFeedbackFor, setOpenFeedbackFor] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!patient) return;
    const [apts, fb] = await Promise.all([
      supabase.from('Appointment').select('*, User(fullName, specialty)').eq('patientId', patient.id).order('scheduledAt', { ascending: false }),
      supabase.from('Feedback').select('appointmentId, rating').eq('patientId', patient.id),
    ]);
    setAppointments(apts.data || []);
    const map: Record<string, any> = {};
    for (const f of fb.data || []) map[f.appointmentId] = f;
    setFeedbackByAppointment(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, [patient]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'CHECKED_IN': case 'IN_CONSULTATION': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': case 'NO_SHOW': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const submitFeedback = async (apt: any) => {
    if (rating === 0) return;
    setSubmitting(true);
    await supabase.from('Feedback').insert({
      hospitalId: patient?.hospitalId,
      patientId: patient?.id,
      appointmentId: apt.id,
      doctorId: apt.doctorId,
      rating,
      comments: comments || null,
    });
    setSubmitting(false);
    setOpenFeedbackFor(null);
    setRating(0);
    setComments('');
    await load();
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
            {appointments.map((apt) => {
              const existingFeedback = feedbackByAppointment[apt.id];
              const canRate = apt.status === 'COMPLETED' && !existingFeedback;
              return (
                <div key={apt.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Dr. {apt.User?.fullName} <span className="text-gray-400 text-sm">— {apt.User?.specialty}</span></p>
                      <p className="text-sm text-gray-400">{new Date(apt.scheduledAt).toLocaleString()}</p>
                      {apt.reason && <p className="text-xs text-gray-500 mt-1">{apt.reason}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {existingFeedback && (
                        <span className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={`w-4 h-4 ${i <= existingFeedback.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
                          ))}
                        </span>
                      )}
                      <Badge className={getStatusColor(apt.status)}>{apt.status.replace('_', ' ')}</Badge>
                    </div>
                  </div>

                  {canRate && (
                    <div className="mt-3">
                      {openFeedbackFor === apt.id ? (
                        <div className="bg-white/5 rounded-lg p-4 space-y-3">
                          <p className="text-sm text-gray-300">How was your visit?</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <button key={i} onClick={() => setRating(i)}>
                                <Star className={`w-7 h-7 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-500'}`} />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Any comments? (optional)"
                            rows={2}
                            className="glass-input w-full px-3 py-2 rounded-lg text-white text-sm"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" disabled={rating === 0 || submitting} onClick={() => submitFeedback(apt)} className="gradient-primary">
                              {submitting ? 'Submitting...' : 'Submit'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setOpenFeedbackFor(null); setRating(0); setComments(''); }}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setOpenFeedbackFor(apt.id)} className="text-sm text-indigo-300 hover:text-indigo-200 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" />Rate this visit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
