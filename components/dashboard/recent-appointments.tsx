'use client';

import { mockAppointments, mockPatients, mockDoctors } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function RecentAppointments() {
  const recent = mockAppointments.slice(0, 5);

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recent.length === 0 ? (
            <p className="text-gray-500 text-sm">No appointments found</p>
          ) : (
            recent.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">{getPatientName(apt.patientId)}</p>
                  <p className="text-xs text-gray-500">
                    {apt.appointmentDate} at {apt.appointmentTime}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{getDoctorName(apt.doctorId)}</p>
                </div>
                <Badge className={getStatusColor(apt.status)}>
                  {apt.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
