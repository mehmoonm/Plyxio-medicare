// User and Authentication types
export type UserRole = 'admin' | 'doctor' | 'patient' | 'staff';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  department?: string;
  createdAt: Date;
}

export interface Session {
  user: User;
  token: string;
}

// Patient types
export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  medicalHistory: string;
  allergies: string;
  emergencyContact: string;
  emergencyPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Doctor types
export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  phone: string;
  email: string;
  department: string;
  yearsOfExperience: number;
  availableSlots: string[];
  consultationFee: number;
  about: string;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment types
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Billing types
export interface Bill {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  description: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod?: string;
  paidDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier: string;
  cost: number;
  lastRestocked: string;
  expiryDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Staff types
export interface Staff {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'on-leave' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard stats types
export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  totalStaff: number;
  pendingAppointments: number;
  lowInventoryItems: number;
}
