'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockAppointments, mockPatients, mockDoctors } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, Trash2, Calendar } from 'lucide-react';

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [appointments, setAppointments] = useState(mockAppointments);

  const filteredAppointments = appointments.filter((apt) => {
    const patient = mockPatients.find((p) => p.id === apt.patientId);
    const matchesSearch = patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPatientName = (patientId: string) => {
    const patient = mockPatients.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = mockDoctors.find((d) => d.id === doctorId);
    return doctor ? `Dr. ${doctor.lastName}` : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (id: string) => {
    setAppointments(appointments.filter((apt) => apt.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Scheduling</h1>
          <p className="text-gray-500 mt-2">Manage appointments and patient visits</p>
        </div>
        <Link href="/dashboard/appointments/new">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center space-x-2">
            {['all', 'scheduled', 'completed', 'cancelled', 'no-show'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Doctor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No appointments found
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {getPatientName(apt.patientId)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {getDoctorName(apt.doctorId)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{apt.appointmentDate} at {apt.appointmentTime}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{apt.reason}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(apt.status)}>
                          {apt.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/appointments/${apt.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/appointments/${apt.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(apt.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
