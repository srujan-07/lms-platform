# AI & Cybersecurity LMS Platform

A production-ready Learning Management System built with Next.js, StackAuth, and Supabase.

## Features

- **Role-Based Access Control**: Student, Lecturer, and Admin roles with granular permissions
- **Secure PDF Management**: Upload, download, and manage lecture notes with signed URLs
- **Row-Level Security**: Database-level security using Supabase RLS policies
- **Audit Logging**: Comprehensive tracking of all critical actions
- **Responsive Design**: Modern UI built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js Server Actions
- **Authentication**: StackAuth
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- StackAuth account
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd LMS
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:
- StackAuth API keys
- Supabase URL and keys

4. Set up the database:

Go to your Supabase project SQL editor and run:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/seed.sql` (optional, for test data)

5. Configure Supabase Storage:

Create a storage bucket named `lecture-notes`:
- Set to **private** (not public)
- Configure allowed MIME types: `application/pdf`
- Set max file size: 10MB

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Roles

### Student
- View enrolled courses
- Access and download PDF lecture notes
- Track learning progress

### Lecturer
- Create and manage courses
- Upload PDF materials
- View enrolled students

### Admin
- Manage all users and roles
- Create/edit/delete courses
- Manage enrollments
- View audit logs

## Project Structure

```
LMS/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Student dashboard
│   ├── lecturer/          # Lecturer dashboard
│   ├── admin/             # Admin dashboard
│   └── handler/           # StackAuth handler
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── admin/            # Admin-specific components
│   ├── lecturer/         # Lecturer-specific components
│   └── student/          # Student-specific components
├── lib/                   # Utility libraries
│   ├── actions/          # Server actions
│   ├── auth/             # Authentication utilities
│   └── supabase/         # Supabase clients
├── supabase/             # Database migrations
└── types/                # TypeScript type definitions
```

## Security Features

- **Authentication**: Secure authentication via StackAuth
- **Authorization**: Role-based access control at application and database levels
- **RLS Policies**: Row-level security prevents unauthorized data access
- **Signed URLs**: Time-limited (15 min) URLs for PDF downloads
- **Audit Logging**: All critical actions are logged
- **Input Validation**: File type and size validation
- **Security Headers**: XSS, clickjacking, and MIME-sniffing protection

## Deployment

### Vercel Deployment

1. Push your code to GitHub

2. Import project in Vercel

3. Add environment variables in Vercel dashboard

4. Deploy!

### Environment Variables

Required environment variables:
- `NEXT_PUBLIC_STACK_PROJECT_ID`
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- `STACK_SECRET_SERVER_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

MIT
