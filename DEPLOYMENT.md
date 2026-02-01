# Deployment Guide - AI & Cybersecurity LMS

This guide will walk you through deploying the LMS platform to production.

## Prerequisites

- GitHub account
- Vercel account
- Supabase account (free tier is sufficient for MVP)
- StackAuth account (free tier is sufficient for MVP)

---

## Step 1: Set Up Supabase

### 1.1 Create a New Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: `lms-platform` (or your preferred name)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for provisioning (~2 minutes)

### 1.2 Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Verify success (you should see "Success. No rows returned")

### 1.3 (Optional) Seed Test Data

1. In SQL Editor, create another new query
2. Copy contents of `supabase/seed.sql`
3. Paste and click "Run"

### 1.4 Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click "Create a new bucket"
3. Configure:
   - **Name**: `lecture-notes`
   - **Public bucket**: ❌ **OFF** (must be private!)
4. Click "Create bucket"
5. Click on the bucket name, then "Policies"
6. The RLS policies in the migration will handle access control

### 1.5 Configure Storage Settings

1. Click on `lecture-notes` bucket
2. Go to "Configuration"
3. Set:
   - **Allowed MIME types**: `application/pdf`
   - **Max file size**: `10485760` (10MB in bytes)

### 1.6 Get API Keys

1. Go to **Settings** → **API**
2. Copy and save:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ Keep this secret!)

---

## Step 2: Set Up StackAuth

### 2.1 Create a New Project

1. Go to [stack-auth.com](https://stack-auth.com) and sign in
2. Click "Create New Project"
3. Fill in:
   - **Project Name**: `LMS Platform`
   - **Project Type**: Web Application

### 2.2 Configure OAuth Providers (Optional but Recommended)

1. Go to **Authentication** → **Providers**
2. Enable providers you want (Google, GitHub recommended):
   - Click on provider
   - Follow setup instructions
   - Add OAuth credentials from provider

### 2.3 Set Callback URLs

1. Go to **Settings** → **URLs**
2. Add callback URLs:
   - Development: `http://localhost:3000/handler/callback`
   - Production: `https://yourdomain.com/handler/callback` (update after Vercel deployment)

### 2.4 Get API Keys

1. Go to **Settings** → **API Keys**
2. Copy and save:
   - **Project ID**
   - **Publishable Client Key**
   - **Secret Server Key** (⚠️ Keep this secret!)

---

## Step 3: Deploy to Vercel

### 3.1 Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: LMS platform"

# Create GitHub repository and push
# (Follow GitHub's instructions for creating a new repository)
git remote add origin https://github.com/yourusername/lms-platform.git
git branch -M main
git push -u origin main
```

### 3.2 Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 3.3 Add Environment Variables

In the Vercel project settings, add these environment variables:

```bash
# StackAuth
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key
STACK_SECRET_SERVER_KEY=your_stack_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

### 3.5 Update StackAuth Callback URL

1. Go back to StackAuth dashboard
2. Update callback URL to your Vercel domain:
   - `https://your-project.vercel.app/handler/callback`

---

## Step 4: Post-Deployment Setup

### 4.1 Create First Admin User

1. Visit your deployed app
2. Sign up with your email
3. Go to Supabase dashboard → **Table Editor** → `users`
4. Find your user record
5. Change `role` from `student` to `admin`
6. Sign out and sign back in

### 4.2 Verify Functionality

Test each role:

**As Admin:**
- ✅ Access admin dashboard
- ✅ Create a test course
- ✅ Create a test user (or change existing user role to lecturer)
- ✅ Enroll a student in a course
- ✅ View audit logs

**As Lecturer:**
- ✅ Access lecturer dashboard
- ✅ View assigned courses
- ✅ Upload a PDF (test file)
- ✅ View uploaded materials

**As Student:**
- ✅ Access student dashboard
- ✅ View enrolled courses
- ✅ Download PDF materials
- ✅ Verify signed URL expires after 15 minutes

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain in Vercel

1. Go to Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### 5.2 Update Environment Variables

1. Update `NEXT_PUBLIC_APP_URL` to your custom domain
2. Redeploy

### 5.3 Update StackAuth

1. Update callback URL in StackAuth to use custom domain

---

## Security Checklist

Before going live, verify:

- [ ] All environment variables are set correctly
- [ ] `SUPABASE_SERVICE_ROLE_KEY` and `STACK_SECRET_SERVER_KEY` are kept secret
- [ ] Supabase storage bucket is **private** (not public)
- [ ] RLS policies are enabled on all tables
- [ ] Test that students cannot access other students' courses
- [ ] Test that lecturers cannot modify other lecturers' courses
- [ ] Test that signed URLs expire after 15 minutes
- [ ] Audit logs are recording actions
- [ ] File upload validation is working (PDF only, max 10MB)

---

## Monitoring & Maintenance

### Vercel Analytics

1. Go to Vercel project → **Analytics**
2. Enable Web Analytics (free)
3. Monitor page views, performance

### Supabase Monitoring

1. Go to Supabase → **Database** → **Logs**
2. Monitor database queries
3. Check for slow queries

### Error Tracking (Optional)

Consider adding Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Scaling Considerations

### When to Upgrade

**Supabase Free Tier Limits:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users

**Vercel Free Tier Limits:**
- 100GB bandwidth/month
- Unlimited deployments

**StackAuth Free Tier Limits:**
- 1,000 monthly active users

### Upgrade Path

1. **Supabase Pro** ($25/month):
   - 8GB database
   - 100GB storage
   - Better performance

2. **Vercel Pro** ($20/month):
   - 1TB bandwidth
   - Advanced analytics

3. **StackAuth Growth** ($99/month):
   - 10,000 MAU
   - Priority support

---

## Troubleshooting

### Build Fails on Vercel

**Error**: `Module not found`
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error**: `Environment variable not found`
- **Solution**: Check all env vars are set in Vercel dashboard

### Authentication Not Working

**Error**: Redirect loop
- **Solution**: Verify StackAuth callback URL matches your domain exactly

**Error**: "Invalid token"
- **Solution**: Check `STACK_SECRET_SERVER_KEY` is correct

### Database Errors

**Error**: "Permission denied"
- **Solution**: Verify RLS policies are enabled
- Check user role in database matches expected role

**Error**: "relation does not exist"
- **Solution**: Run migrations in Supabase SQL Editor

### File Upload Fails

**Error**: "File too large"
- **Solution**: Check file is under 10MB

**Error**: "Invalid file type"
- **Solution**: Ensure file is PDF format

**Error**: "Upload failed"
- **Solution**: Verify storage bucket exists and is named `lecture-notes`

---

## Support

For issues:
1. Check this deployment guide
2. Review README.md
3. Check Supabase logs
4. Check Vercel deployment logs
5. Review StackAuth documentation

---

## Cost Estimate

**MVP (Free Tier):**
- Vercel: $0/month
- Supabase: $0/month
- StackAuth: $0/month
- **Total: $0/month**

**Production (1000+ users):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- StackAuth Growth: $99/month
- **Total: $144/month**

---

## Next Steps

After successful deployment:

1. ✅ Create admin account
2. ✅ Add lecturers
3. ✅ Create courses
4. ✅ Enroll students
5. ✅ Upload course materials
6. ✅ Monitor usage and performance
7. ✅ Gather user feedback
8. ✅ Plan feature enhancements

Congratulations! Your LMS platform is now live! 🎉
