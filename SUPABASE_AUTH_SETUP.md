# Supabase Auth Setup Guide

## Step 1: Enable Email Auth in Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Authentication** → **Providers** in the left sidebar
3. Find **Email** provider and make sure it's **Enabled**
4. Configure email settings:
   - **Enable email confirmations**: You can disable this for faster testing, or keep it enabled for production
   - **Secure email change**: Enable this for production
   - **Double confirm email changes**: Optional, but recommended

## Step 2: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. You can customize:
   - **Confirm signup** - Email sent when user signs up
   - **Magic Link** - If you enable magic link auth
   - **Change Email Address** - When user changes email
   - **Reset Password** - Password reset emails

3. For testing, you can use the default templates
4. For production, customize them to match your INVY branding

## Step 3: Set Up Site URL (Important!)

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your app URL:
   - Development: `http://localhost:3000`
   - Production: `https://invy.rsvp` (or your Vercel domain)
3. Add **Redirect URLs**:
   - `http://localhost:3000/dashboard` (for development)
   - `https://invy.rsvp/dashboard` (for production)
   - `http://localhost:3000/**` (wildcard for dev)
   - `https://invy.rsvp/**` (wildcard for production)

## Step 4: Test the Signup Flow

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`
3. Enter an email and password
4. If email confirmations are enabled:
   - Check your email for confirmation link
   - Click the link to confirm
   - You'll be redirected to `/dashboard`
5. If email confirmations are disabled:
   - You'll be automatically signed in and redirected to `/dashboard`

## Step 5: Test Super-Admin Access

1. Sign up with `zak@aozakari.com`
2. The system will automatically assign the `superadmin` role
3. You should see an "Admin" link in the dashboard navigation
4. Navigate to `/admin` to access the super-admin dashboard

## Step 6: Test Login Flow

1. Sign out (click "Sign out" in dashboard)
2. Navigate to `http://localhost:3000/login`
3. Enter your email and password
4. You should be redirected to `/dashboard`

## Troubleshooting

### "Invalid login credentials"
- Make sure you've confirmed your email (if email confirmations are enabled)
- Check that the email/password are correct
- Try resetting your password

### "Email not confirmed"
- Check your email inbox for the confirmation link
- Or disable email confirmations in Supabase dashboard for testing

### "User not found in dashboard"
- The user record should be created automatically on first signup
- Check Supabase dashboard → **Table Editor** → **users** table
- Verify the user was created with the correct email

### Super-admin role not assigned
- Check that the migration `003_add_user_role_and_stripe.sql` was run
- Verify in Supabase dashboard → **Table Editor** → **users** table that `role` column exists
- Manually set role: `UPDATE users SET role = 'superadmin' WHERE email = 'zak@aozakari.com';`

## Production Checklist

Before going live:

- [ ] Enable email confirmations
- [ ] Customize email templates
- [ ] Set production Site URL
- [ ] Add production redirect URLs
- [ ] Test signup/login flow
- [ ] Test password reset flow
- [ ] Verify super-admin access works
- [ ] Set up email rate limiting (if needed)

## Additional Auth Features (Future)

You can enable these later if needed:

- **Magic Link** - Passwordless login via email link
- **OAuth providers** - Google, GitHub, etc.
- **SMS Auth** - Phone number authentication
- **MFA** - Multi-factor authentication

