# Hospital Management System

A comprehensive web-based hospital management system built with Next.js, React, and Tailwind CSS. The system provides role-based access control for different user types with specialized dashboards and features.

## Features

### Core Modules

1. **Patient Management**
   - View and manage patient records
   - Store medical history and allergies
   - Track emergency contact information
   - Search and filter patients by name or email

2. **Appointment Scheduling**
   - Schedule appointments between patients and doctors
   - View upcoming and completed appointments
   - Track appointment status (scheduled, completed, cancelled, no-show)
   - Filter appointments by status

3. **Doctor Management**
   - Manage doctor profiles and credentials
   - Track specialization and department
   - Display consultation fees
   - View doctor availability and experience

4. **Billing & Payments**
   - Generate and manage invoices
   - Track payment status (pending, paid, overdue)
   - View financial metrics (total revenue, pending payments)
   - Filter bills by patient and status

5. **Inventory Management**
   - Track medical supplies and equipment
   - Monitor stock levels and reorder points
   - Get alerts for low stock items
   - Calculate total inventory value

6. **Staff Management**
   - Manage hospital staff records
   - Track staff department and position
   - Monitor salary information and status (active, on-leave, inactive)
   - View payroll analytics

### Role-Based Access Control

The system includes 4 user roles with different permissions:

- **Admin**: Full access to all modules
- **Doctor**: Access to appointments and patient list
- **Patient**: Access to their appointments and billing
- **Staff**: Access to patient management and inventory

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Modern web browser

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials

Test the system with these credentials:

```
Admin:
  Email: admin@hospital.com
  Password: admin123

Doctor:
  Email: dr.smith@hospital.com
  Password: doctor123

Patient:
  Email: john@example.com
  Password: patient123

Staff:
  Email: nurse1@hospital.com
  Password: staff123
```

## Project Structure

```
app/
├── login/              # Authentication page
├── dashboard/          # Main dashboard layout
├── dashboard/patients/ # Patient management
├── dashboard/appointments/ # Appointment scheduling
├── dashboard/doctors/  # Doctor management
├── dashboard/billing/  # Billing & payments
├── dashboard/inventory/ # Inventory tracking
└── dashboard/staff/    # Staff management

components/
├── ui/                 # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── badge.tsx
└── dashboard/          # Dashboard-specific components
    ├── sidebar.tsx
    ├── header.tsx
    ├── stat-card.tsx
    └── appointment widgets

lib/
├── types.ts            # TypeScript type definitions
├── mock-data.ts        # Sample data
├── auth-context.tsx    # Authentication context
└── utils.ts            # Utility functions
```

## Technology Stack

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Custom session-based auth with localStorage
- **State Management**: React Context API

## Features in Detail

### Authentication System
- Email and password-based login
- Session management with localStorage
- Role-based middleware for protected routes
- Automatic redirect to login for unauthenticated users

### Dashboard Features
- Role-specific navigation menus
- Real-time statistics and metrics
- Search and filter functionality across all modules
- Responsive design for desktop and tablet

### Data Management
- Mock data structure with TypeScript types
- CRUD operations for all modules
- Client-side state management
- Search and filter operations

## Customization

### Adding New Patients
Navigate to Patient Management and click "New Patient" to add a new patient record with full details.

### Scheduling Appointments
Go to Appointment Scheduling and use "New Appointment" to schedule appointments between patients and doctors.

### Managing Inventory
Track supplies in the Inventory module with alerts for low stock items below the reorder level.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

- Database integration (PostgreSQL/Supabase)
- Real API endpoints
- Email notifications
- SMS alerts
- Advanced reporting and analytics
- Print and export functionality
- Mobile app
- Video consultation integration
- Electronic health records (EHR)

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Code Style

The project follows Next.js and React best practices with:
- Server and Client Component separation
- TypeScript for type safety
- Tailwind CSS for styling
- Lucide icons for consistency

## License

MIT License - feel free to use this project as a foundation for your hospital management system.

## Support

For questions or issues, please refer to the documentation or create an issue in the repository.
