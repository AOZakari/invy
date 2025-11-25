# Vercel Deployment Guide

## Quick Deploy

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select repository: `AOZakari/invy`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**
   
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_key
   NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
   ```
   
   **Important:**
   - After first deploy, update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
   - If you add a custom domain, update it again

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

## Custom Domain Setup

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Add domain: `invy.rsvp`
   - Follow DNS configuration instructions

2. **Update Environment Variable:**
   - Go to Settings → Environment Variables
   - Update `NEXT_PUBLIC_APP_URL` to `https://invy.rsvp`
   - Redeploy (or it will auto-deploy)

## Post-Deployment

1. **Test the deployment:**
   - Visit your Vercel URL
   - Create a test event
   - Verify email delivery
   - Test RSVP flow

2. **Monitor:**
   - Check Vercel logs for errors
   - Monitor Supabase dashboard for queries
   - Check Resend dashboard for email delivery

## Troubleshooting

- **Build fails:** Check environment variables are set correctly
- **Email not sending:** Verify Resend API key and domain verification
- **Database errors:** Check Supabase connection and RLS policies
- **404 errors:** Verify all routes are properly configured

