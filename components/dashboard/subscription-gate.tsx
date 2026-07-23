'use client';

import { useAuth } from '@/lib/auth-context';
import { useModules } from '@/lib/hospital-modules-context';
import { Clock, ShieldAlert } from 'lucide-react';

const BLOCKED_STATUSES = ['PENDING_APPROVAL', 'SUSPENDED', 'CANCELLED'];

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { subscriptionStatus, loading } = useModules();

  if (loading) return <>{children}</>;
  if (!subscriptionStatus || !BLOCKED_STATUSES.includes(subscriptionStatus)) return <>{children}</>;

  const isPending = subscriptionStatus === 'PENDING_APPROVAL';

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="glass-card rounded-2xl p-8 max-w-md text-center space-y-4">
        {isPending ? <Clock className="w-10 h-10 text-amber-400 mx-auto" /> : <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />}
        <h2 className="text-xl font-bold text-white">
          {isPending ? 'Your account is pending approval' : 'This account is currently inactive'}
        </h2>
        <p className="text-gray-400 text-sm">
          {isPending
            ? "Thanks for signing up! We're finishing setup on our end — this usually includes confirming payment (online or offline/cash). You'll get access as soon as it's approved."
            : 'Please reach out to PLYXIO support to resolve this before continuing.'}
        </p>
        <button onClick={() => logout()} className="text-sm text-indigo-300 hover:underline">
          Log out
        </button>
      </div>
    </div>
  );
}
