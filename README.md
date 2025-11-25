# INVY

**Collect RSVPs in seconds, no signups, no bullshit.**

A minimalist, Linktree-style RSVP web app built with Next.js, TypeScript, Supabase, and Resend.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Email:** Resend
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Resend account and API key

### Local Development

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend Configuration
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Set up Supabase database:**

   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Go to your project's SQL Editor
   
   c. Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql`
   
   d. Run the SQL script
   
   e. Get your project credentials:
      - Go to Project Settings → API
      - Copy `Project URL` → use as `NEXT_PUBLIC_SUPABASE_URL`
      - Copy `anon` `public` key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      - Copy `service_role` `secret` key → use as `SUPABASE_SERVICE_ROLE_KEY`
      - ⚠️ Keep the service role key secret! Never expose it client-side.

4. **Set up Resend:**

   a. Create an account at [resend.com](https://resend.com)
   
   b. Get your API key from the dashboard
   
   c. Add it to `.env.local` as `RESEND_API_KEY`
   
   d. **Important:** Update the `from` email in `lib/emails/resend.ts`:
      - For development: Use Resend's test domain (e.g., `onboarding@resend.dev`)
      - For production: Verify your own domain in Resend and update to your domain

5. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note:** The build process requires environment variables to be set. If you see build errors, make sure all environment variables in `.env.local` are properly configured.

## Important Notes

### Email Configuration

- **Development:** The email template in `lib/emails/resend.ts` uses `noreply@invy.rsvp` as the sender. For testing, update this to use Resend's test domain (e.g., `onboarding@resend.dev`).
- **Production:** You must verify your own domain in Resend and update the `from` field accordingly.

### Database Setup

- The migration file creates all necessary tables, indexes, and triggers.
- Row Level Security (RLS) is not configured in the MVP. For production, consider adding RLS policies.
- The `admin_secret` field is never exposed in public APIs or client-side code.

### Authentication (Phase 6)

- Dashboard structure is ready but requires Supabase Auth integration.
- To enable auth:
  1. Set up Supabase Auth in your project
  2. Uncomment auth checks in `app/dashboard/layout.tsx`
  3. Create login/signup pages
  4. Connect user IDs to event ownership

## Deployment to Vercel

1. **Push to GitHub:**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect to Vercel:**

- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add all environment variables from `.env.local`
- Deploy

3. **Required Environment Variables on Vercel:**

- `NEXT_PUBLIC_SUPABASE_URL` (public, exposed to client)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, exposed to client)
- `SUPABASE_SERVICE_ROLE_KEY` (private, server-side only)
- `RESEND_API_KEY` (private, server-side only)
- `NEXT_PUBLIC_APP_URL` (public, your production URL)

## Project Structure

```
app/              # Next.js App Router routes
components/       # React components
lib/
  db/            # Data access layer (Supabase queries)
  emails/        # Email utilities (Resend)
  supabase/      # Supabase client configuration
  utils/         # Utility functions
  validations/   # Zod validation schemas
types/           # TypeScript type definitions
```

## Features

### MVP (Phase 1-5) - ✅ Complete

- ✅ Create events without login
- ✅ Public event pages with RSVP forms
- ✅ Admin view via secret link
- ✅ Email notifications
- ✅ Event editing via admin link
- ✅ RSVP statistics and management

### Phase 6 - Dashboard Scaffold (Structure Ready)

- ✅ Dashboard UI structure
- ✅ Event list and overview components
- ⚠️ **Auth integration needed:** The dashboard structure is in place, but Supabase Auth needs to be fully integrated:
  - Uncomment auth checks in `app/dashboard/layout.tsx`
  - Set up login/signup pages
  - Connect user sessions to event ownership
  - Implement event claiming functionality

### Future Enhancements

- 🔜 Full user authentication and dashboards
- 🔜 Event claiming by email or admin secret
- 🔜 Pro/Business tier features (CSV export, advanced themes, capacity limits)
- 🔜 Guest list visibility controls
- 🔜 Analytics and reporting

## License

ISC

