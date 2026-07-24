'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/lib/settings-context';
import { currencySymbol } from '@/lib/currency';
import { supabase } from '@/lib/supabase/client';
import { canManageFinances } from '@/lib/permissions';
import { TrendingUp, TrendingDown, Wallet, Receipt, ArrowRight, Scale, FileWarning, BookOpen } from 'lucide-react';

const SECTIONS = [
  { href: '/dashboard/finances/ledger', title: 'Ledger', description: 'Every transaction — revenue, expenses, payroll — filterable by date, exportable', icon: BookOpen, color: 'text-amber-300' },
  { href: '/dashboard/reports', title: 'Revenue & Reports', description: 'Revenue trends, appointment volume, doctor performance', icon: TrendingUp, color: 'text-emerald-300' },
  { href: '/dashboard/finances/payroll', title: 'Payroll', description: 'Generate and manage staff compensation by pay period', icon: Wallet, color: 'text-indigo-300' },
  { href: '/dashboard/finances/expenses', title: 'Expenses', description: 'Rent, utilities, supplies, and other operating costs', icon: Receipt, color: 'text-cyan-300' },
];

export default function FinancesHubPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const currency = currencySymbol(settings.currency);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ revenue: 0, expenses: 0, payroll: 0, receivable: 0, receivableCount: 0 });

  useEffect(() => {
    if (!canManageFinances(user?.role)) { setLoading(false); return; }
    (async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [paymentsRes, expensesRes, payrollRes, outstandingRes] = await Promise.all([
        supabase.from('Payment').select('amount').gte('paidAt', monthStart),
        supabase.from('Expense').select('amount').gte('expenseDate', monthStart.slice(0, 10)),
        supabase.from('PayrollRecord').select('totalAmount').eq('periodMonth', now.getMonth() + 1).eq('periodYear', now.getFullYear()),
        supabase.from('Invoice').select('total, amountPaid').neq('status', 'PAID'),
      ]);

      const revenue = (paymentsRes.data || []).reduce((s, p: any) => s + Number(p.amount), 0);
      const expenses = (expensesRes.data || []).reduce((s, e: any) => s + Number(e.amount), 0);
      const payroll = (payrollRes.data || []).reduce((s, p: any) => s + Number(p.totalAmount), 0);
      const receivable = (outstandingRes.data || []).reduce((s, i: any) => s + (Number(i.total) - Number(i.amountPaid)), 0);

      setSummary({ revenue, expenses, payroll, receivable, receivableCount: (outstandingRes.data || []).length });
      setLoading(false);
    })();
  }, [user]);

  if (!canManageFinances(user?.role)) {
    return <div className="text-gray-400">This page is only available to admins and accountants.</div>;
  }

  const net = summary.revenue - summary.expenses - summary.payroll;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold heading-gradient">Finances</h1>
        <p className="text-gray-400 mt-2">Everything money-related for your hospital, in one place</p>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Revenue (This Month)</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{currency} {summary.revenue.toLocaleString()}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Expenses + Payroll</p>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-white">{currency} {(summary.expenses + summary.payroll).toLocaleString()}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net (This Month)</p>
              <Scale className="w-4 h-4 text-indigo-400" />
            </div>
            <p className={`text-2xl font-bold ${net >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{currency} {net.toLocaleString()}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Outstanding (A/R)</p>
              <FileWarning className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{currency} {summary.receivable.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{summary.receivableCount} unpaid invoice{summary.receivableCount === 1 ? '' : 's'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
