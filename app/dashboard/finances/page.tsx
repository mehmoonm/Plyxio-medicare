'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { canManageFinances } from '@/lib/permissions';
import { TrendingUp, Wallet, Receipt, ArrowRight } from 'lucide-react';

const SECTIONS = [
  { href: '/dashboard/reports', title: 'Revenue & Reports', description: 'Revenue trends, appointment volume, doctor performance', icon: TrendingUp, color: 'text-emerald-300' },
  { href: '/dashboard/finances/payroll', title: 'Payroll', description: 'Generate and manage staff compensation by pay period', icon: Wallet, color: 'text-indigo-300' },
  { href: '/dashboard/finances/expenses', title: 'Expenses', description: 'Rent, utilities, supplies, and other operating costs', icon: Receipt, color: 'text-cyan-300' },
];

export default function FinancesHubPage() {
  const { user } = useAuth();

  if (!canManageFinances(user?.role)) {
    return <div className="text-gray-400">This page is only available to admins and accountants.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold heading-gradient">Finances</h1>
        <p className="text-gray-400 mt-2">Everything money-related for your hospital, in one place</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SECTIONS.map(({ href, title, description, icon: Icon, color }) => (
          <Link key={href} href={href} className="glass-card rounded-2xl p-6 hover:bg-white/5 transition-colors group">
            <Icon className={`w-8 h-8 ${color} mb-3`} />
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {title}
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h2>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
