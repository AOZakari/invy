# Supabase auth setup (signup / login)

Do these steps in the **Supabase Dashboard** so signup and login work on your app (e.g. https://invy-xi.vercel.app).

---

## 1. Open URL configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. In the left sidebar: **Authentication** → **URL Configuration**.

---

## 2. Set Site URL and Redirect URLs

- **Site URL**  
  Set to your app’s root URL, for example:
  - Production: `https://invy-xi.vercel.app`
  - Local: `http://localhost:3000`

- **Redirect URLs**  
  Add these (one per line or as allowed list, depending on UI):
  - `https://invy-xi.vercel.app/**`
  - `https://invy-xi.vercel.app/dashboard`
  - `https://invy-xi.vercel.app/auth/callback`
  - For local dev: `http://localhost:3000/**`, `http://localhost:3000/dashboard`, `http://localhost:3000/auth/callback`

Save the URL configuration.

---

## 3. Turn off “Confirm email” (so signup works without email)

If you leave “Confirm email” on, Supabase will only send signup emails if you’ve set up custom SMTP. Otherwise you get no email and users can’t log in.

**Recommended for now: turn confirmation off.**

1. In the left sidebar: **Authentication** → **Providers**.
2. Click **Email**.
3. Find **“Confirm email”** (or “Enable email confirmations”).
4. **Turn it OFF** and save.

Result:

- Users can sign up and are logged in immediately (no email link).
- No signup emails are sent; you can turn confirmation on later when you configure SMTP.

---

## 4. Check that Email provider is on

Still under **Authentication** → **Providers** → **Email**:

- Ensure the Email provider is **Enabled**.
- Save if you changed anything.

---

## 5. Test the flow

1. Open your app: `https://invy-xi.vercel.app/signup` (or your real URL).
2. Sign up with an email and password (e.g. 6+ characters).
3. You should be redirected to the dashboard (no email needed).
4. Sign out, then go to **Login** and sign in with the same email/password. You should land on the dashboard again.

If you still get errors:

- **“Invalid login credentials”** → Wrong password, or that user doesn’t exist. Try signing up again with a new email.
- **“Email not confirmed”** → Step 3 wasn’t applied or didn’t save. Turn off “Confirm email” again and try a new signup.
- **Redirect goes to wrong place / auth error** → Re-check Step 2 (Site URL and Redirect URLs must match your app’s URL exactly).

---

## Optional: send signup emails later

When you want confirmation emails:

1. **Authentication** → **Providers** → **Email** → turn **on** “Confirm email”.
2. **Project Settings** → **Auth** (or **Authentication** → **SMTP**) and set **Custom SMTP** (e.g. Resend, SendGrid, Mailgun). Without custom SMTP, Supabase’s built-in sending is limited and may not deliver.

Until then, keeping “Confirm email” **off** is the reliable way to have signup and login working.
