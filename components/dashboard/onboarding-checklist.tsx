'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle2, Circle, X, Rocket } from 'lucide-react';

interface ChecklistItem {
  label: string;
  description: string;
  href: string;
  done: boolean;
}

export function OnboardingChecklist() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (!user?.hospitalId) return;
    (async () => {
      const [hosp, depts, staff, patients, wards] = await Promise.all([
        supabase.from('Hospital').select('onboardingDismissed, phone, address').eq('id', user.hospitalId).single(),
        supabase.from('Department').select('id', { count: 'exact', head: true }),
        supabase.from('User').select('id', { count: 'exact', head: true }).neq('id', user.id),
        supabase.from('Patient').select('id', { count: 'exact', head: true }),
        supabase.from('Ward').select('id', { count: 'exact', head: true }),
      ]);

      setDismissed(!!hosp.data?.onboardingDismissed);

      const checklist: ChecklistItem[] = [
        {
          label: 'Set up your hospital profile',
          description: 'Add your contact info, logo, and branding',
          href: '/dashboard/settings',
          done: !!(hosp.data?.phone || hosp.data?.address),
        },
        {
          label: 'Add a department',
          description: 'Organize your hospital into departments like Cardiology, Radiology, etc.',
          href: '/dashboard/departments',
          done: (depts.count || 0) > 0,
        },
        {
          label: 'Add your staff',
          description: 'Invite doctors, nurses, and other team members',
          href: '/dashboard/staff/new',
          done: (staff.count || 0) > 0,
        },
        {
          label: 'Set up rooms & beds',
          description: 'Configure wards, floors, and beds for admissions',
          href: '/dashboard/admissions/beds',
          done: (wards.count || 0) > 0,
        },
        {
          label: 'Add your first patient',
          description: 'Register a patient or import existing records',
          href: '/dashboard/patients/new',
          done: (patients.count || 0) > 0,
        },
      ];

      setItems(checklist);
      setLoading(false);
    })();
  }, [user?.hospitalId, user?.id]);

  const handleDismiss = async () => {
    setDismissed(true);
    if (user?.hospitalId) {
      await supabase.from('Hospital').update({ onboardingDismissed: true }).eq('id', user.hospitalId);
    }
  };

  if (loading || dismissed) return null;

  const allDone = items.every((i) => i.done);
  const completedCount = items.filter((i) => i.done).length;

  if (allDone) return null;

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 border border-indigo-500/30">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="w-6 h-6 text-indigo-300" />
          <div>
            <h2 className="text-lg font-bold text-white">Get your hospital set up</h2>
            <p className="text-sm text-gray-400">{completedCount} of {items.length} steps done</p>
          </div>
        </div>
        <button onClick={handleDismiss} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400" title="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(completedCount / items.length) * 100}%` }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${item.done ? 'bg-white/5' : 'bg-white/5 hover:bg-white/10'}`}
          >
            {item.done ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${item.done ? 'text-gray-400 line-through' : 'text-white'}`}>{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
