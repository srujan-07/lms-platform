# Access Codes Configuration

This file contains the access codes for creating Lecturer and Admin accounts.

## 🔑 Where to Set Your Access Codes

You have two options:

### Option 1: Environment Variables (Recommended for Production)

Add these to your `.env.local` file:

```bash
# Role Access Codes
LECTURER_ACCESS_CODE=your_secret_lecturer_code_here
ADMIN_ACCESS_CODE=your_secret_admin_code_here
```

### Option 2: Direct in Code (For Testing)

Edit `app/api/auth/validate-role/route.ts` and change the default codes:

```typescript
const ACCESS_CODES = {
  lecturer: 'LECTURER2024',  // Change this
  admin: 'ADMIN2024',         // Change this
};
```

## 📝 How It Works

1. **Student Sign-Up**: No access code required (default role)
2. **Lecturer Sign-Up**: Requires the lecturer access code
3. **Admin Sign-Up**: Requires the admin access code

## 🎯 Current Default Codes (Change These!)

- **Lecturer Code**: `LECTURER2024`
- **Admin Code**: `ADMIN2024`

## 🔒 Security Recommendations

1. **Change the default codes immediately**
2. **Use strong, unique codes** (at least 12 characters)
3. **Store codes in environment variables**, not in the code
4. **Share codes securely** with authorized users only
5. **Rotate codes periodically** for better security

## Example Strong Codes

```bash
LECTURER_ACCESS_CODE=L3ctur3r!Secure#2024$Key
ADMIN_ACCESS_CODE=Adm1n!SuperSecure#2024$Master
```

---

**Important**: After changing the codes, restart your dev server for changes to take effect!
