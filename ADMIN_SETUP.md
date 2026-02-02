# Admin Setup Guide - StackAuth Role Management

## Overview

This LMS platform uses **StackAuth** for authentication and role management. User roles are stored in StackAuth's `serverMetadata` and determine access to different parts of the application.

## User Roles

There are three user roles in the system:

- **Student** (default) - Can view enrolled courses and access learning materials
- **Lecturer** - Can create courses and upload learning materials
- **Admin** - Full system access, can manage users, courses, and enrollments

---

## Setting Up Admin Users

### Method 1: Via StackAuth Dashboard (Recommended)

1. **Log in to your StackAuth Dashboard**
   - Go to [https://app.stack-auth.com](https://app.stack-auth.com)
   - Navigate to your project

2. **Find the User**
   - Go to the "Users" section
   - Find the user you want to make an admin

3. **Set Server Metadata**
   - Click on the user
   - Find the "Server Metadata" section
   - Add or edit the metadata:
   ```json
   {
     "role": "admin"
   }
   ```
   - Save the changes

4. **Verify**
   - The user will now have admin access
   - They should be redirected to `/admin/dashboard` upon login

### Method 2: Via StackAuth API

If you need to set roles programmatically (e.g., for bulk operations), you can use the StackAuth API:

```typescript
import { stackServerApp } from '@/lib/auth/stackauth';

// Set a user as admin
await stackServerApp.updateUser(userId, {
  serverMetadata: {
    role: 'admin'
  }
});
```

---

## Setting Other Roles

### Lecturer Role

```json
{
  "role": "lecturer"
}
```

### Student Role (Default)

```json
{
  "role": "student"
}
```

Or simply don't set any `serverMetadata.role` - the system defaults to 'student'.

---

## Role-Based Access Control

### Admin Permissions
- ✅ Manage all users
- ✅ Manage all courses
- ✅ View enrollments
- ✅ Access audit logs
- ✅ Upload content
- ✅ Access lecturer dashboard

### Lecturer Permissions
- ✅ Create and manage own courses
- ✅ Upload learning materials
- ❌ Cannot manage users
- ❌ Cannot view audit logs

### Student Permissions
- ✅ View enrolled courses
- ✅ Access learning materials
- ❌ Cannot create courses
- ❌ Cannot upload content

---

## Dashboard Routes

Each role has a dedicated dashboard:

- **Students**: `/dashboard`
- **Lecturers**: `/lecturer/dashboard`
- **Admins**: `/admin/dashboard`

Users are automatically redirected to their appropriate dashboard based on their role.

---

## Important Notes

> [!IMPORTANT]
> **Single Source of Truth**: All roles are managed exclusively in StackAuth's `serverMetadata`. The Supabase database does NOT store role information.

> [!WARNING]
> **Server Metadata Security**: `serverMetadata` is only accessible from the server-side. This ensures role information cannot be tampered with from the client.

> [!TIP]
> **Default Role**: If a user doesn't have a role set in `serverMetadata`, they will default to 'student' role.

---

## Troubleshooting

### User doesn't have admin access after setting role

1. **Check StackAuth Dashboard**
   - Verify the `serverMetadata.role` is set to `"admin"`
   - Make sure there are no typos (case-sensitive)

2. **Clear Session**
   - Have the user sign out and sign back in
   - This ensures the new role is loaded

3. **Check Browser Console**
   - Look for any authentication errors
   - Verify the user object has the correct role

### User sees wrong dashboard

- The system automatically redirects users based on their role
- If a student tries to access `/admin/dashboard`, they'll be redirected to `/dashboard`
- Check that the role is correctly set in StackAuth

### How to change a user's role

1. Go to StackAuth Dashboard
2. Find the user
3. Update their `serverMetadata.role`
4. User must sign out and sign back in for changes to take effect

---

## Security Best Practices

1. **Limit Admin Access**
   - Only grant admin role to trusted users
   - Regularly audit admin users

2. **Use Server Metadata**
   - Never store sensitive role information in client-accessible metadata
   - Always use `serverMetadata` for roles

3. **Monitor Role Changes**
   - Keep track of who has admin access
   - Review role assignments periodically

4. **Protect API Keys**
   - Keep your StackAuth secret key secure
   - Never commit API keys to version control
   - Use environment variables

---

## Quick Reference

### Check Current User's Role (Server-Side)

```typescript
import { getCurrentUser } from '@/lib/auth/rbac';

const user = await getCurrentUser();
console.log(user.role); // 'admin' | 'lecturer' | 'student'
```

### Require Specific Role

```typescript
import { requireRole } from '@/lib/auth/rbac';

// Require admin role
const user = await requireRole('admin');

// Allow multiple roles
const user = await requireRole(['lecturer', 'admin']);
```

### Check Permissions

```typescript
import { hasPermission } from '@/lib/auth/rbac';

const canManageUsers = await hasPermission('manage_users');
```

---

## Support

If you encounter issues with role management:

1. Check the StackAuth documentation: [https://docs.stack-auth.com](https://docs.stack-auth.com)
2. Review the `lib/auth/rbac.ts` file for implementation details
3. Check server logs for authentication errors
