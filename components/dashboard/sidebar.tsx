'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  FileText,
  Package,
  UserCheck,
} from 'lucide-react';

const adminMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
  { href: '/dashboard/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/dashboard/billing', label: 'Billing', icon: FileText },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Package },
  { href: '/dashboard/staff', label: 'Staff', icon: UserCheck },
];

const doctorMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
  { href: '/dashboard/patients', label: 'Patients', icon: Users },
];

const patientMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
  { href: '/dashboard/billing', label: 'Billing', icon: FileText },
];

const staffMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  let menuItems = [];
  if (user?.role === 'admin') menuItems = adminMenuItems;
  else if (user?.role === 'doctor') menuItems = doctorMenuItems;
  else if (user?.role === 'patient') menuItems = patientMenuItems;
  else if (user?.role === 'staff') menuItems = staffMenuItems;

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col">
      <div className="p-6 border-b border-indigo-800">
        <h1 className="text-xl font-bold">Hospital Mgmt</h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-100 hover:bg-indigo-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
