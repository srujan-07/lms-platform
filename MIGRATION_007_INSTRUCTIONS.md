# How to Apply the RLS Fix

The onboarding error was caused by RLS policies that don't allow the service role (admin client) to insert/update data. This is needed because StackAuth users don't have Supabase sessions.

## Steps to Fix

### Option 1: Using Supabase Dashboard SQL Editor (Recommended for Testing)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor** 
3. Create a new query and copy the contents of `supabase/migrations/007_fix_admin_client_rls.sql`
4. Execute the query
5. Restart the LMS application

### Option 2: Automatic Migration (Production)

If you're using a migration system, the migration file `supabase/migrations/007_fix_admin_client_rls.sql` will be executed automatically with your deployment pipeline.

## What the Fix Does

1. **Users Table**: Modified the `"Admins can insert users"` policy to allow the service role to insert users. This fixes the middleware user sync on first login.

2. **Student Profiles Table**: Modified the INSERT/UPDATE policies to allow the service role to create/update student profiles. This fixes the onboarding flow.

## Why This Works

- StackAuth users don't have Supabase authentication context
- We use `createAdminClient()` (with service role key) to bypass this limitation
- The service role is trusted and can bypass RLS with the new policies
- Authentication is still verified by StackAuth before calling these APIs

## Testing

After applying the migration:

1. Register a new account in the LMS
2. You should be redirected to the onboarding page
3. Fill in class and section
4. Submit the form
5. You should be redirected to the dashboard

If it still fails, check:
- Browser Console (F12) for error messages
- Server logs in the terminal for detailed errors
- Supabase dashboard to verify the migration was applied
