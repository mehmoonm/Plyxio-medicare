'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockDoctors } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, Trash2, Star } from 'lucide-react';

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState(mockDoctors);

  const filteredDoctors = doctors.filter(
    (d) =>
      d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setDoctors(doctors.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
          <p className="text-gray-500 mt-2">Manage doctor profiles and specializations</p>
        </div>
        <Link href="/dashboard/doctors/new">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Doctor</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No doctors found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Dr. {doctor.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">Department:</span>
                      <Badge variant="secondary">{doctor.department}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Experience: {doctor.yearsOfExperience} years</p>
                      <p>Fee: ${doctor.consultationFee}</p>
                      <p>License: {doctor.licenseNumber}</p>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{doctor.about}</p>
                  </div>

                  <div className="border-t pt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/dashboard/doctors/${doctor.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/doctors/${doctor.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doctor.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
