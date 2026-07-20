'use client';

import { mockAppointments, mockPatients } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export function UpcomingAppointments() {
  const upcoming = mockAppointments.filter((apt) => apt.status === 'scheduled').slice(0, 5);

  const getPatientName = (patientId: string) => {
    const patient = mockPatients.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Upcoming Appointments</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming appointments</p>
          ) : (
            upcoming.map((apt) => (
              <div key={apt.id} className="flex items-start space-x-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="bg-blue-500 text-white rounded-lg p-2">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{getPatientName(apt.patientId)}</p>
                  <p className="text-sm text-gray-600">{apt.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {apt.appointmentDate} at {apt.appointmentTime}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
