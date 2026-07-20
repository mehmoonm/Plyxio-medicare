'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockPatients } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      const found = mockPatients.find((p) => p.id === resolvedParams.id);
      if (found) {
        setPatient(found);
        setFormData(found);
      }
    })();
  }, [params]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    patient || {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      bloodType: 'O+',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      medicalHistory: '',
      allergies: '',
      emergencyContact: '',
      emergencyPhone: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLoading(false);
    router.push(`/dashboard/patients/${patient?.id || 'new'}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </h1>
          <p className="text-gray-400 mt-2">Update or create patient information</p>
        </div>
        <Link href="/dashboard/patients">
          <Button variant="outline" className="gap-2 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/20">
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Button>
        </Link>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">First Name *</label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
                className="glass-input w-full px-4 py-3 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">Last Name *</label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
                className="glass-input w-full px-4 py-3 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">Date of Birth *</label>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="glass-input w-full px-4 py-3 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="glass-input w-full px-4 py-3 rounded-lg text-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="pt-6 border-t border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">Email *</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
                className="glass-input w-full px-4 py-3 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">Phone *</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                required
                className="glass-input w-full px-4 py-3 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="pt-6 border-t border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Address</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">Street Address *</label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address"
                required
                className="glass-input w-full px-4 py-3 rounded-lg text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">City *</label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className="glass-input w-full px-4 py-3 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">State *</label>
                <Input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  className="glass-input w-full px-4 py-3 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">Zip Code *</label>
                <Input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="Zip code"
                  required
                  className="glass-input w-full px-4 py-3 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="pt-6 border-t border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Medical Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">Blood Type *</label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className="glass-input w-full px-4 py-3 rounded-lg text-white"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold text-slate-300 block mb-2">Medical History</label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="Enter patient medical history"
              rows={4}
              className="glass-input w-full px-4 py-3 rounded-lg text-white resize-none"
            />
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold text-slate-300 block mb-2">Allergies</label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="Enter any allergies"
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-lg text-white resize-none"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="pt-6 border-t border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">Contact Person *</label>
              <Input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Name of emergency contact"
                required
                className="glass-input w-full px-4 py-3 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 block mb-2">Phone Number *</label>
              <Input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                placeholder="Phone number"
                required
                className="glass-input w-full px-4 py-3 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-white/10 flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="gradient-primary text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 gap-2 flex-1"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Patient'}
          </Button>
          <Link href="/dashboard/patients" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
