'use client';

import { useAuth } from '@/lib/auth-context';
import { mockPatients, mockAppointments, mockBills, mockStaff, mockInventory } from '@/lib/mock-data';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentAppointments } from '@/components/dashboard/recent-appointments';
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments';
import { Users, Calendar, FileText, Package, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  // Calculate stats
  const totalPatients = mockPatients.length;
  const totalAppointments = mockAppointments.length;
  const totalRevenue = mockBills
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.amount, 0);
  const totalStaff = mockStaff.length;
  const upcomingAppointments = mockAppointments.filter((a) => a.status === 'scheduled').length;
  const lowInventoryItems = mockInventory.filter((item) => item.quantity < item.reorderLevel).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-500 mt-2">Here&apos;s an overview of your hospital management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Patients"
          value={totalPatients}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Appointments"
          value={totalAppointments}
          icon={Calendar}
          color="bg-green-500"
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue}`}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        {user?.role === 'admin' && (
          <>
            <StatCard
              title="Total Staff"
              value={totalStaff}
              icon={Users}
              color="bg-orange-500"
            />
            <StatCard
              title="Pending Appointments"
              value={upcomingAppointments}
              icon={Calendar}
              color="bg-red-500"
            />
            <StatCard
              title="Low Inventory Items"
              value={lowInventoryItems}
              icon={Package}
              color="bg-yellow-500"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAppointments />
        {user?.role !== 'patient' && <UpcomingAppointments />}
      </div>
    </div>
  );
}
