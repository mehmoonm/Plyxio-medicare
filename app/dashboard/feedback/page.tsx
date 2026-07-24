'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { isAdmin } from '@/lib/permissions';
import { Star, MessageSquare } from 'lucide-react';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin(user?.role)) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('Feedback')
        .select('*, Patient(fullName), User:doctorId(fullName)')
        .order('createdAt', { ascending: false })
        .limit(200);
      setFeedback(data || []);
      setLoading(false);
    })();
  }, [user]);

  if (!isAdmin(user?.role)) {
    return <div className="text-gray-400">This page is only available to hospital admins.</div>;
  }

  const avgRating = feedback.length > 0 ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : 0;

  const byDoctor: Record<string, { name: string; total: number; count: number }> = {};
  for (const f of feedback) {
    const name = f.User?.fullName || 'Unassigned';
    if (!byDoctor[name]) byDoctor[name] = { name, total: 0, count: 0 };
    byDoctor[name].total += f.rating;
    byDoctor[name].count += 1;
  }
  const doctorStats = Object.values(byDoctor).map((d) => ({ ...d, avg: d.total / d.count })).sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold heading-gradient flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-indigo-300" />Patient Feedback
        </h1>
        <p className="text-gray-400 mt-2">Post-visit satisfaction ratings and comments</p>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : feedback.length === 0 ? (
        <div className="glass-card rounded-2xl p-6"><p className="text-gray-400">No feedback submitted yet</p></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="glass-card rounded-2xl p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Overall Average</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-white">{avgRating.toFixed(1)}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">from {feedback.length} response{feedback.length === 1 ? '' : 's'}</p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">By Doctor</p>
              <div className="space-y-2">
                {doctorStats.slice(0, 5).map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Dr. {d.name}</span>
                    <span className="text-white font-semibold">{d.avg.toFixed(1)} ★ ({d.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-white">Recent Feedback</h2>
            </div>
            <div className="divide-y divide-white/10">
              {feedback.slice(0, 50).map((f) => (
                <div key={f.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">{f.Patient?.fullName} {f.User?.fullName ? `— Dr. ${f.User.fullName}` : ''}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                  {f.comments && <p className="text-sm text-gray-400 mt-1">{f.comments}</p>}
                  <p className="text-xs text-gray-500 mt-1">{new Date(f.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
