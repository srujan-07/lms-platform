# Supabase Setup Instructions

Follow these steps to set up your Supabase project for the LMS platform.

## 1. Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in project details and create

## 2. Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for first-time setup)

1. Go to SQL Editor in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click "Run" to execute
5. Verify all tables are created in Table Editor

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## 3. Seed Database (Optional)

For testing purposes, you can seed the database with sample data:

1. In SQL Editor, create a new query
2. Copy and paste contents of `seed.sql`
3. Click "Run"

This will create:
- Sample users (1 admin, 2 lecturers, 3 students)
- 3 courses
- Sample enrollments
- Sample lecture notes metadata

## 4. Configure Storage

### Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Click "Create a new bucket"
3. Name it: `lecture-notes`
4. **Important**: Set as **Private** (not public)
5. Click "Create bucket"

### Configure Bucket Settings

The bucket should be configured with:
- **Name**: `lecture-notes`
- **Public**: No (private bucket)
- **Allowed MIME types**: `application/pdf`
- **File size limit**: 10MB

Note: Access control is handled by the application using signed URLs, not bucket policies.

## 5. Get API Credentials

1. Go to Settings → API in Supabase dashboard
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: For client-side requests
   - **service_role key**: For server-side admin operations (keep secret!)

## 6. Set Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 7. Verify Setup

### Check Tables

Go to Table Editor and verify these tables exist:
- users
- courses
- enrollments
- lecture_notes
- audit_logs

### Check RLS Policies

1. Go to Authentication → Policies
2. Verify each table has RLS enabled
3. Check that policies are created for each table

### Test Storage

1. Go to Storage → lecture-notes
2. Try uploading a test PDF
3. Verify you can generate a signed URL

## Troubleshooting

### Tables not created
- Check SQL Editor for error messages
- Ensure you have the UUID extension enabled
- Try running the migration again

### RLS policies not working
- Verify RLS is enabled on all tables
- Check that `auth.uid()` is being set correctly
- Test with different user roles

### Storage upload fails
- Verify bucket name is exactly `lecture-notes`
- Check bucket is set to private
- Ensure file is PDF format and under 10MB

## Next Steps

After Supabase setup:
1. Set up StackAuth for authentication
2. Configure environment variables in your app
3. Deploy to Vercel
4. Create your first admin user
