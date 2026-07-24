'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/lib/settings-context';
import { currencySymbol } from '@/lib/currency';
import { canManageFinances } from '@/lib/permissions';
import { getPresetRange, type DateRangePreset } from '@/lib/date-ranges';
import { exportToCsv } from '@/lib/csv-export';
import { generateLedgerPdf } from '@/lib/pdf/ledger-pdf';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { BookOpen, Download, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  type: 'Revenue' | 'Expense' | 'Payroll';
  description: string;
  category: string;
  amount: number; // positive for revenue, negative for expense/payroll
  link?: string;
}

export default function LedgerPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const currency = currencySymbol(settings.currency);
  const [preset, setPreset] = useState<DateRangePreset>('month');
  const [customStart, setCustomStart] = useState(new Date().toISOString().slice(0, 10));
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().slice(0, 10));
  const [typeFilter, setTypeFilter] = useState<'all' | 'Revenue' | 'Expense' | 'Payroll'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const range = getPresetRange(preset, customStart, customEnd);

  useEffect(() => {
    if (!canManageFinances(user?.role)) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const startIso = new Date(`${range.start}T00:00:00`).toISOString();
      const endIso = new Date(`${range.end}T23:59:59`).toISOString();

      const [paymentsRes, expensesRes, payrollRes] = await Promise.all([
        supabase.from('Payment').select('id, amount, paidAt, method, Invoice(id, invoiceNo, Patient(fullName))').gte('paidAt', startIso).lte('paidAt', endIso),
        supabase.from('Expense').select('id, amount, expenseDate, category, description, Department(name)').gte('expenseDate', range.start).lte('expenseDate', range.end),
        supabase.from('PayrollRecord').select('id, totalAmount, paidAt, User(fullName, role)').eq('status', 'PAID').gte('paidAt', startIso).lte('paidAt', endIso),
      ]);

      const txns: Transaction[] = [];

      for (const p of paymentsRes.data || []) {
        const inv = (p as any).Invoice;
        txns.push({
          id: `pay-${p.id}`,
          date: p.paidAt,
          type: 'Revenue',
          description: `${inv?.Patient?.fullName || 'Patient'} — Invoice ${inv?.invoiceNo || ''} (${p.method})`,
          category: 'Payment',
          amount: Number(p.amount),
          link: inv?.id ? `/dashboard/billing/${inv.id}` : undefined,
        });
      }

      for (const e of expensesRes.data || []) {
        const deptName = (e as any).Department?.name;
        txns.push({
          id: `exp-${e.id}`,
          date: e.expenseDate,
          type: 'Expense',
          description: e.description || e.category,
          category: deptName ? `${e.category} · ${deptName}` : e.category,
          amount: -Number(e.amount),
        });
      }

      for (const pr of payrollRes.data || []) {
        const staff = (pr as any).User;
        txns.push({
          id: `payroll-${pr.id}`,
          date: pr.paidAt,
          type: 'Payroll',
          description: `${staff?.fullName || 'Staff'} (${staff?.role?.replace('_', ' ') || ''})`,
          category: 'Payroll',
          amount: -Number(pr.totalAmount),
        });
      }

      txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(txns);
      setLoading(false);
    })();
  }, [preset, customStart, customEnd, user]);

  if (!canManageFinances(user?.role)) {
    return <div className="text-gray-400">This page is only available to admins and accountants.</div>;
  }

  const filtered = typeFilter === 'all' ? transactions : transactions.filter((t) => t.type === typeFilter);
  const totalIn = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = totalIn - totalOut;

  const handleExportCsv = () => {
    exportToCsv(
      `Ledger-${range.label.replace(/\s+/g, '-')}`,
      filtered.map((t) => ({
        Date: new Date(t.date).toLocaleDateString(),
        Type: t.type,
        Description: t.description,
        Category: t.category,
        Amount: t.amount,
      }))
    );
  };

  const handleExportPdf = () => {
    generateLedgerPdf({
      hospitalName: settings.hospitalName,
      hospitalLogo: settings.logo,
      periodLabel: range.label,
      currencySymbol: currency,
      transactions: filtered,
      totalIn,
      totalOut,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold heading-gradient flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-300" />Ledger
          </h1>
          <p className="text-gray-400 mt-2">Every revenue, expense, and payroll transaction in one place</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCsv} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-sm font-medium">
            <Download className="w-4 h-4" />CSV
          </button>
          <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-sm font-medium">
            <FileText className="w-4 h-4" />PDF
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <DateRangePicker
          preset={preset}
          customStart={customStart}
          customEnd={customEnd}
          onChange={(p, s, e) => { setPreset(p); setCustomStart(s); setCustomEnd(e); }}
        />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'Revenue', 'Expense', 'Payroll'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total In</p>
          </div>
          <p className="text-xl font-bold text-emerald-300">{currency} {totalIn.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="w-4 h-4 text-red-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Out</p>
          </div>
          <p className="text-xl font-bold text-red-300">{currency} {totalOut.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Net</p>
          <p className={`text-xl font-bold ${net >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{currency} {net.toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-gray-400 p-6">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 p-6">No transactions in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-400">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const row = (
                    <tr key={t.id} className={`border-b border-white/5 ${t.link ? 'hover:bg-white/5 cursor-pointer' : ''}`}>
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          t.type === 'Revenue' ? 'bg-emerald-100 text-emerald-800' : t.type === 'Expense' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                        }`}>{t.type}</span>
                      </td>
                      <td className="py-3 px-4 text-white">{t.description}</td>
                      <td className="py-3 px-4 text-gray-400">{t.category}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${t.amount >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                        {t.amount >= 0 ? '+' : '-'}{currency} {Math.abs(t.amount).toLocaleString()}
                      </td>
                    </tr>
                  );
                  return t.link ? <Link key={t.id} href={t.link} className="contents">{row}</Link> : row;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
