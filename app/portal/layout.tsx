'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { PatientAuthProvider, usePatientAuth } from '@/lib/patient-auth-context';
import { LayoutDashboard, Calendar, Pill, FileText, Receipt, MessageCircle, LogOut } from 'lucide-react';

const menuItems = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/appointments', label: 'Appointments', icon: Calendar },
  { href: '/portal/records', label: 'Medical Records', icon: FileText },
  { href: '/portal/prescriptions', label: 'Prescriptions', icon: Pill },
  { href: '/portal/billing', label: 'Billing', icon: Receipt },
  { href: '/portal/messages', label: 'Messages', icon: MessageCircle },
];

function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, patient, logout } = usePatientAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/portal/login' && pathname !== '/portal/reset-password') {
      router.push('/portal/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (pathname === '/portal/login' || pathname === '/portal/reset-password') return <>{children}</>;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-64 sidebar-container flex flex-col">
        <div className="p-6 sidebar-border">
          <h1 className="text-lg font-bold sidebar-text">MediCare</h1>
          <p className="text-xs sidebar-text-muted">Patient Portal</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'sidebar-nav-active' : 'sidebar-nav-inactive'}`}>
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 sidebar-border space-y-3">
          <div className="text-xs sidebar-text">
            <p className="font-semibold sidebar-text mb-1">{patient?.fullName}</p>
            <p className="sidebar-text-muted">{patient?.mrn}</p>
          </div>
          <button onClick={() => { logout(); router.push('/portal/login'); }} className="flex items-center gap-2 text-sm sidebar-text-muted hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />Log out
          </button>
        </div>
      </div>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientAuthProvider>
      <PortalShell>{children}</PortalShell>
    </PatientAuthProvider>
  );
}
