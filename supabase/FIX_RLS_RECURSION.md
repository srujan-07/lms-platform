# Fixing RLS Infinite Recursion Error

## Problem
The error "infinite recursion detected in policy for relation 'users'" occurs because the RLS policies on the `users` table query the same table to check admin permissions, creating a circular dependency.

## Root Cause
In `001_initial_schema.sql`, these policies cause recursion:
```sql
-- Lines 98-104: Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
      -- ↑ This queries the users table while checking access to the users table!
    )
  );
```

## Solution
We've created migration `002_fix_rls_recursion.sql` that:
1. Drops the problematic admin policies on the `users` table
2. Relies on the **service role client** (`createAdminClient()`) for admin operations

## Why This Works
- **Service role client bypasses RLS** entirely
- Your code already uses `createAdminClient()` in admin functions like `getAllUsers()`, `updateUserRole()`, etc.
- The API endpoints properly check authentication and authorization before calling these functions

## How to Apply

### Option 1: Run the migration in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/002_fix_rls_recursion.sql`
4. Run the SQL

### Option 2: Use Supabase CLI (if you have it set up)
```bash
supabase db push
```

## Quick Fix (Manual SQL)
If you want to fix it immediately, run this in your Supabase SQL Editor:

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
```

## Verification
After applying the fix:
1. Try creating a course again - should work
2. Admin operations still work because they use `createAdminClient()`
3. Regular users can still view their own profile via the remaining policy

## Why Your Code Still Works
Your application code is already structured correctly:
- ✅ `lib/actions/users.ts` uses `createAdminClient()` for admin operations
- ✅ API endpoints check authentication via StackAuth
- ✅ Authorization is enforced in the server actions
- ✅ Service role bypasses RLS for admin operations

The RLS policies were redundant for admin operations and causing the recursion issue.
