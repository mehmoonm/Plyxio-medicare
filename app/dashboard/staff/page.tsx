'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockStaff } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, Trash2, Users } from 'lucide-react';

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [staff, setStaff] = useState(mockStaff);

  const filteredStaff = staff.filter(
    (s) =>
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeStaff = staff.filter((s) => s.status === 'active').length;
  const onLeave = staff.filter((s) => s.status === 'on-leave').length;
  const totalPayroll = staff.reduce((sum, s) => sum + s.salary, 0);

  const handleDelete = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-2">Manage hospital staff and departments</p>
        </div>
        <Link href="/dashboard/staff/new">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-gray-500 text-sm">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{staff.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{activeStaff}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-gray-500 text-sm">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{onLeave}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-gray-500 text-sm">Total Payroll</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">${totalPayroll / 1000}k</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search staff by name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Position</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Salary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No staff found
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{member.position}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{member.department}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm text-balance">{member.email}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">${member.salary}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/staff/${member.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/staff/${member.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
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
