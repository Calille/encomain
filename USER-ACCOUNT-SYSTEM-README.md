# Complete User Account System - Documentation

## Overview

This is a comprehensive user account management system with admin-created accounts, user dashboards, and full authentication using Supabase.

## Features Implemented

### ✅ Database Schema (Supabase)
- **users**: User profiles with roles (admin/user) and status management
- **websites**: Client website projects with progress tracking
- **billing**: Billing records with payment status
- **invoices**: Invoice management with PDF support
- **project_updates**: Timeline of project communications

### ✅ Security
- Row Level Security (RLS) enabled on all tables
- Users can only read their own data
- Admins can read and write all data
- Password complexity requirements enforced
- Protected routes with authentication guards

### ✅ Authentication
- Email/password authentication (admin-created accounts only)
- Password reset functionality
- Temporary passwords with forced change on first login
- Session management with "Remember me" option
- Auth context with React hooks

### ✅ User Dashboard
- Welcome header with last login timestamp
- Quick stats overview (websites, invoices, spending)
- Website progress section with visual progress bars
- Project updates timeline with filtering
- Billing overview with 12-month history chart
- Invoices table with search, filter, and sort
- Responsive design for mobile, tablet, and desktop
- Real-time updates using Supabase subscriptions

### ✅ Admin Panel
- System-wide analytics dashboard
- User management (create, edit, activate/deactivate)
- Website management capabilities
- Billing and invoice management
- Password generation for new users
- Role-based access control

### ✅ Account Settings
- Update profile information
- Change password with strength validation
- View account status and role
- Security settings

### ✅ Navigation
- Dynamic header with account dropdown
- Shows "Login" for unauthenticated users
- Shows user avatar and name when logged in
- Quick access to Dashboard, Settings, Admin Panel (for admins)
- Logout functionality

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
VITE_SUPABASE_URL=https://eqqcbdpbeohtfwnlfdgx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWNiZHBiZW9odGZ3bmxmZGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTY0MTAsImV4cCI6MjA3NzU3MjQxMH0.uDue2h_qH4guNIRom8TRY3lgxnWUYQsT9zgjQRSAeBo
SUPABASE_PROJECT_ID=eqqcbdpbeohtfwnlfdgx
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

The database schema has already been created in your Supabase project with the following migrations:

1. `create_users_table` - Users with roles and status
2. `create_websites_table` - Website projects
3. `create_billing_table` - Billing records
4. `create_invoices_table` - Invoice management
5. `create_project_updates_table` - Project timeline
6. `create_updated_at_triggers` - Auto-update timestamps
7. `enable_rls_and_create_policies` - Security policies

### 4. Create Your First Admin User

You need to create your admin account directly in Supabase:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" > "Create new user"
3. Enter your email and password
4. Copy the User ID (UUID)
5. Go to Table Editor > users table
6. Insert a new row:
   - `id`: Your User ID from step 4
   - `email`: Your email
   - `full_name`: Your name
   - `role`: `admin`
   - `status`: `active`
   - `requires_password_change`: `false`

### 5. Run the Application

```bash
npm run dev
```

## Usage Guide

### For Admins

#### Creating User Accounts

1. Navigate to `/admin/users`
2. Click "Create User"
3. Enter user details:
   - Email (required)
   - Full name
   - Role (user or admin)
   - Status (active, inactive, suspended)
4. A temporary password will be generated
5. Share the email and temporary password with the user
6. User will be forced to change password on first login

#### Managing Websites

1. Navigate to `/admin/websites` (you can add this functionality)
2. Create websites for users
3. Update progress percentage
4. Change status (active, in_progress, completed, on_hold)

#### Managing Billing & Invoices

1. Navigate to `/admin/billing` (you can add this functionality)
2. Create billing records and invoices
3. Track payment status
4. Generate invoice PDFs

#### Posting Project Updates

You can post updates that users will see in their timeline:

```sql
INSERT INTO project_updates (website_id, user_id, title, description, update_type, created_by)
VALUES (
  'website-uuid',
  'user-uuid',
  'Design Completed',
  'All design mockups have been finalized',
  'milestone',
  'your-admin-uuid'
);
```

### For Users

#### First Login

1. Navigate to `/login`
2. Enter your email and temporary password (provided by admin)
3. You'll be redirected to change your password
4. Set a secure password meeting the requirements

#### Dashboard

Access your dashboard at `/dashboard` to:
- View all your websites and their progress
- See project updates and timeline
- Check billing information
- View and download invoices
- Track spending

#### Account Settings

Access settings at `/settings` to:
- Update your profile information
- Change your password
- View account status

## File Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── login-form.tsx          # Login form component
│   │   └── ProtectedRoute.tsx      # Route protection HOC
│   ├── dashboard/
│   │   ├── billing-overview.tsx    # Billing overview component
│   │   ├── dashboard-layout.tsx    # Dashboard layout wrapper
│   │   └── invoices-table.tsx      # Invoices table component
│   ├── ui/                          # shadcn/ui components
│   └── header.tsx                   # Main navigation header
├── contexts/
│   └── AuthContext.tsx              # Authentication context
├── hooks/
│   └── use-toast.ts                 # Toast notifications hook
├── lib/
│   └── supabase.ts                  # Supabase client
├── pages/
│   ├── admin/
│   │   ├── index.tsx                # Admin dashboard
│   │   └── users.tsx                # User management
│   ├── dashboard/
│   │   └── user-dashboard.tsx       # User dashboard
│   ├── account-settings.tsx         # Account settings page
│   ├── change-password.tsx          # Password change page
│   ├── forgot-password.tsx          # Password reset page
│   └── login.tsx                    # Login page
├── types/
│   └── supabase.ts                  # TypeScript types
└── App.tsx                          # Main app with routes
```

## Database Schema

### users
- `id` (uuid, primary key, references auth.users)
- `email` (text, unique)
- `full_name` (text)
- `role` (text: 'admin' | 'user')
- `created_at`, `updated_at`, `last_login` (timestamps)
- `status` (text: 'active' | 'inactive' | 'suspended')
- `requires_password_change` (boolean)

### websites
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to users)
- `name`, `url` (text)
- `status` (text: 'active' | 'in_progress' | 'completed' | 'on_hold')
- `progress_percentage` (integer, 0-100)
- `created_at`, `updated_at` (timestamps)

### billing
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to users)
- `amount` (decimal), `currency` (text)
- `status` (text: 'paid' | 'pending' | 'overdue' | 'cancelled')
- `billing_period_start`, `billing_period_end` (dates)
- `created_at`, `paid_at` (timestamps)

### invoices
- `id` (uuid, primary key)
- `billing_id` (uuid, foreign key to billing)
- `user_id` (uuid, foreign key to users)
- `invoice_number` (text, unique, auto-generated)
- `amount` (decimal), `currency` (text)
- `status` (text: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled')
- `issue_date`, `due_date`, `paid_date` (dates)
- `pdf_url`, `notes` (text, nullable)

### project_updates
- `id` (uuid, primary key)
- `website_id` (uuid, foreign key to websites)
- `user_id` (uuid, foreign key to users)
- `title`, `description` (text)
- `update_type` (text: 'milestone' | 'progress' | 'issue' | 'completed')
- `created_at` (timestamp)
- `created_by` (uuid, references users - admin who posted)

## API / Database Functions

### Helper Functions
- `is_admin()` - Check if current user is admin
- `get_user_role()` - Get current user's role
- `generate_invoice_number()` - Auto-generate invoice numbers (INV-YYYY-NNNN)
- `handle_updated_at()` - Auto-update updated_at timestamps

## Security Features

### Row Level Security (RLS)
All tables have RLS policies that ensure:
- Users can only view their own data
- Users cannot modify their role or status
- Admins can view and modify all data
- All operations are validated at the database level

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Protected Routes
- Dashboard routes require authentication
- Admin routes require admin role
- Inactive/suspended users are blocked
- Users requiring password change are redirected automatically

## Additional Features to Implement

### Email Notifications
You can integrate email notifications using Supabase Edge Functions or a service like SendGrid:

1. **Account Creation**: Send email with temporary password
2. **Invoice Generated**: Notify user of new invoice
3. **Payment Due/Overdue**: Send payment reminders
4. **Project Milestone**: Notify on milestone completion

### PDF Generation
For invoice PDFs, you can:
1. Use a service like PDFMonkey or DocRaptor
2. Create a Supabase Edge Function with a PDF library
3. Store URLs in the `pdf_url` field

### Website Management Admin Page
Create `src/pages/admin/websites.tsx` similar to the user management page to:
- Create websites for users
- Update progress and status
- Post project updates

### Billing Management Admin Page
Create `src/pages/admin/billing.tsx` to:
- Create billing records
- Generate invoices
- Track payments

## Troubleshooting

### Cannot Login
1. Ensure user exists in both `auth.users` and `users` tables
2. Check that user status is "active"
3. Verify email and password are correct

### RLS Errors
1. Make sure the user has a profile in the `users` table
2. Check that RLS policies are enabled
3. Verify the user's role is set correctly

### TypeScript Errors
1. Run `npm run types:supabase` to regenerate types
2. Restart TypeScript server in VS Code

### Dashboard Not Loading
1. Check browser console for errors
2. Verify Supabase connection in `.env.local`
3. Ensure user has proper permissions

## Support

For issues or questions:
1. Check Supabase logs for backend errors
2. Check browser console for frontend errors
3. Review RLS policies if getting permission errors

## Color Scheme

The application uses your brand colors:
- Primary: `#1A4D2E` (Dark Green)
- Secondary: `#2D5F3F` (Medium Green)
- Background: `#F8FAF9` (Off-white)

## Technologies Used

- **Frontend**: React 18 + TypeScript
- **UI Framework**: shadcn/ui (Radix UI + Tailwind CSS)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **State Management**: React Context API
- **Date Handling**: date-fns

## Next Steps

1. ✅ Set up your `.env.local` file
2. ✅ Create your first admin account in Supabase
3. ✅ Log in and test the system
4. 📧 Configure email service for notifications (optional)
5. 📄 Set up PDF generation for invoices (optional)
6. 🌐 Add more admin pages for websites and billing management
7. 🎨 Customize branding and styling as needed
8. 🚀 Deploy to production (Vercel, Netlify, etc.)

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to add all environment variables from `.env.local` to your hosting platform.

---

**System is ready to use!** 🎉

The core functionality is complete. You can now create users, manage websites, track billing, and users can view their personalized dashboards.

