'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading || !user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'var(--background-gradient)' }}>
      <header className="backdrop-blur-xl bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">PLYXIO Platform Admin</h1>
          <p className="text-xs text-gray-400">{user.fullName}</p>
        </div>
        <button onClick={() => { logout(); router.push('/login'); }} className="text-sm text-gray-400 hover:text-white">
          Log out
        </button>
      </header>
      <main className="p-4 sm:p-8">{children}</main>
    </div>
  );
}
