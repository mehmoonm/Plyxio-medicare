# Getting Started with Hospital Management System

## Quick Start (2 minutes)

1. **Start the development server:**
   ```bash
   cd /vercel/share/v0-project
   pnpm dev
   ```

2. **Open your browser:**
   Navigate to `http://localhost:3000`

3. **Login with demo account:**
   - Email: `admin@hospital.com`
   - Password: `admin123`

That's it! You're now in the Hospital Management System dashboard.

## Testing Different Roles

Each role has different access levels. Try these credentials:

### Admin Account
- Email: `admin@hospital.com`
- Password: `admin123`
- Access: All modules (Patients, Appointments, Doctors, Billing, Inventory, Staff)

### Doctor Account
- Email: `dr.smith@hospital.com`
- Password: `doctor123`
- Access: Dashboard, Appointments, Patients (limited)

### Patient Account
- Email: `john@example.com`
- Password: `patient123`
- Access: Dashboard, Appointments, Billing

### Staff Account
- Email: `nurse1@hospital.com`
- Password: `staff123`
- Access: Dashboard, Patients, Inventory

## What You Can Do

### As an Admin
- ✅ View all 6 modules in the sidebar
- ✅ See complete dashboard with all statistics
- ✅ Manage patients, doctors, staff, appointments, billing, and inventory
- ✅ Track hospital metrics (revenue, appointments, staff, etc.)

### As a Doctor
- ✅ View only Dashboard, Appointments, and Patients
- ✅ See appointments assigned to you
- ✅ View patient records
- ✅ Track revenue from consultations

### As a Patient
- ✅ View your appointments
- ✅ See billing history
- ✅ Check appointment details

### As Staff
- ✅ Manage patients
- ✅ Track inventory levels
- ✅ Get alerts for low stock items

## Key Features to Explore

### 1. Patient Management
- Click **Patients** in the sidebar
- See all registered patients with blood type and contact info
- Click the **New Patient** button to add a patient
- Use search to find patients quickly

### 2. Appointment Scheduling
- Click **Appointments** in the sidebar
- View all appointments with status (scheduled/completed/cancelled)
- Filter by status using the status buttons
- See doctor assignment and appointment details

### 3. Doctor Management
- Click **Doctors** in the sidebar (Admin only)
- Browse doctor profiles with specialization
- View consultation fees and experience
- See department assignment

### 4. Billing & Payments
- Click **Billing** in the sidebar
- Track revenue and pending payments
- View invoice status (paid/pending/overdue)
- Filter bills by patient

### 5. Inventory Management
- Click **Inventory** in the sidebar (Admin/Staff)
- Track medical supplies
- See low stock alerts in red boxes
- Monitor total inventory value

### 6. Staff Management
- Click **Staff** in the sidebar (Admin only)
- View all hospital staff
- Track salary information
- See staff status (active/on-leave/inactive)

## Dashboard Overview

The dashboard shows:
- **Total Patients**: Count of all registered patients
- **Total Appointments**: Count of all appointments
- **Total Revenue**: Sum of all paid invoices
- **Total Staff**: Count of all staff members (Admin only)
- **Pending Appointments**: Count of scheduled appointments
- **Low Inventory Items**: Count of items below reorder level

Plus two cards showing:
- **Recent Appointments**: Latest 5 appointments
- **Upcoming Appointments**: Next scheduled appointments

## Navigation Tips

- **Sidebar**: Use the left sidebar to navigate between modules
- **Search**: Use search boxes to find records quickly
- **Filters**: Use status filters to view specific categories
- **Header**: Shows current user and logout button
- **Icons**: Each action has clear icons (view, edit, delete)

## User Interface Elements

- 🔵 **Blue Cards**: Dashboard statistics
- 📋 **Tables**: Data lists with search and filters
- 🏷️ **Badges**: Status indicators (color-coded)
- 🔘 **Buttons**: Actions like "New Patient", "Add Staff"
- 📱 **Responsive**: Works on desktop, tablet, and mobile

## Sample Data Included

The system comes with pre-populated data:
- 2 Patients (John Doe, Jane Wilson)
- 2 Doctors (Dr. Smith - Cardiology, Dr. Johnson - Orthopedics)
- 2 Appointments (Scheduled for July 25-26)
- 2 Invoices (One paid, one pending)
- 3 Inventory Items (PPE supplies)
- 2 Staff Members (Nurse, Phlebotomist)

## File Structure

Key files you might want to customize:

```
lib/
├── mock-data.ts         ← Edit sample data here
├── types.ts             ← Modify data structures
└── auth-context.tsx     ← Authentication logic

app/
├── login/page.tsx       ← Login page
└── dashboard/*/page.tsx ← Each module

components/
├── ui/                  ← Reusable components
└── dashboard/           ← Dashboard components
```

## Common Tasks

### Add New Patient
1. Go to Patients module
2. Click "New Patient" button
3. Fill in patient details
4. Confirm

### Schedule Appointment
1. Go to Appointments module
2. Click "New Appointment"
3. Select patient and doctor
4. Choose date and time
5. Add notes
6. Save

### Create Invoice
1. Go to Billing module
2. Click "New Invoice"
3. Select patient
4. Enter amount and description
5. Set due date
6. Save

### Track Inventory
1. Go to Inventory module
2. View stock levels
3. Check for low stock alerts
4. Add item button to stock new supplies

## Troubleshooting

### Page not loading?
- Check console for errors (F12 → Console)
- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cache and cookies

### Session expires?
- You'll be redirected to login page
- Log in again with your credentials

### Data not persisting?
- This is a demo with mock data
- Data resets on page refresh (to add persistence, connect to a database)

## Next Steps

1. **Explore All Modules**: Try each role to understand different views
2. **Test Interactions**: Create new records, search, and filter
3. **Customize Design**: Modify colors in globals.css
4. **Add Database**: Connect to PostgreSQL/Supabase for real data persistence
5. **Extend Features**: Add more fields or modules as needed

## Support Resources

- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Lucide Icons: https://lucide.dev

## Performance Tips

- The system is optimized for modern browsers
- Search and filtering happens instantly on the client
- Statistics update in real-time
- Responsive design adapts to all screen sizes

Happy exploring! 🏥
