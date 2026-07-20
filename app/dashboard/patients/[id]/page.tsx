'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockPatients } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Heart, AlertCircle, Users } from 'lucide-react';

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = mockPatients.find((p) => p.id === id);

  if (!patient) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/patients">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Patients
          </Button>
        </Link>
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-lg font-semibold text-white">Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/patients">
          <Button variant="outline" className="gap-2 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/20">
            <ArrowLeft className="w-4 h-4" />
            Back to Patients
          </Button>
        </Link>
        <Link href={`/dashboard/patients/${patient.id}/edit`}>
          <Button className="gradient-primary text-white font-semibold gap-2">
            <Edit className="w-4 h-4" />
            Edit Patient
          </Button>
        </Link>
      </div>

      {/* Patient Profile Card */}
      <div className="glass-card rounded-2xl p-8 space-y-6">
        {/* Name and Status */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-slate-400 mt-2">Patient ID: {patient.id}</p>
          </div>
          <Badge className="px-4 py-2 bg-cyan-600/30 border border-cyan-400/50 text-cyan-200">
            Active Patient
          </Badge>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm">Email</p>
                <p className="text-white font-medium">{patient.email}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Phone</p>
                <p className="text-white font-medium">{patient.phone}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Date of Birth</p>
                <p className="text-white font-medium">{patient.dateOfBirth}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Medical Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm">Blood Type</p>
                <p className="text-white font-medium">{patient.bloodType}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Gender</p>
                <p className="text-white font-medium capitalize">{patient.gender}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="pt-6 border-t border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-cyan-400" />
            Address
          </h2>
          <div className="space-y-2">
            <p className="text-white font-medium">{patient.address}</p>
            <p className="text-slate-400">
              {patient.city}, {patient.state} {patient.zipCode}
            </p>
          </div>
        </div>

        {/* Medical History Section */}
        <div className="pt-6 border-t border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Medical History</h2>
          <p className="text-slate-300 whitespace-pre-wrap">{patient.medicalHistory}</p>
        </div>

        {/* Allergies Section */}
        <div className="pt-6 border-t border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            Allergies
          </h2>
          <p className="text-slate-300">{patient.allergies}</p>
        </div>

        {/* Emergency Contact Section */}
        <div className="pt-6 border-t border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            Emergency Contact
          </h2>
          <div className="space-y-2">
            <div>
              <p className="text-slate-400 text-sm">Contact Person</p>
              <p className="text-white font-medium">{patient.emergencyContact}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Phone Number</p>
              <p className="text-white font-medium">{patient.emergencyPhone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
