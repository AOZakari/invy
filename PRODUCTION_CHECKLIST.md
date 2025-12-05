# Production Readiness Checklist

## ✅ Completed (MVP)

- [x] Core event creation flow
- [x] Public event pages with RSVP forms
- [x] Manage view via secret link
- [x] Email notifications (Resend)
- [x] Database schema and migrations
- [x] TypeScript types and validation
- [x] Responsive design
- [x] Build configuration

## 🚀 Deployment Steps

### 1. Vercel Deployment

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `AOZakari/invy`
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
5. Add Environment Variables (from your `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel domain, e.g., `https://invy-xyz.vercel.app`)
6. Click "Deploy"

### 2. Domain Configuration

- Add your custom domain `invy.rsvp` in Vercel project settings
- Update DNS records as instructed by Vercel
- Update `NEXT_PUBLIC_APP_URL` to `https://invy.rsvp`

## 🔴 Critical for Production

### 1. Email Domain Verification (Resend)

- [ ] Verify `invy.rsvp` domain in Resend dashboard
- [ ] Update `lib/emails/resend.ts` to use verified domain
- [ ] Test email delivery
- [ ] Set up SPF/DKIM records (Resend will provide)

### 2. Database Security (Supabase)

- [ ] Enable Row Level Security (RLS) policies
- [ ] Review and restrict public access to sensitive tables
- [ ] Set up database backups
- [ ] Configure connection pooling if needed

### 3. Environment Variables

- [ ] Verify all env vars are set in Vercel
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is NOT exposed client-side
- [ ] Use Vercel's environment variable encryption

## 💳 Stripe Integration (Priority)

### Setup Required

1. **Stripe Account**
   - [ ] Create Stripe account
   - [ ] Get API keys (test and live)
   - [ ] Set up webhook endpoint

2. **Install Dependencies**
   ```bash
   npm install stripe @stripe/stripe-js
   ```

3. **Environment Variables**
   - `STRIPE_SECRET_KEY` (server-side only)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET` (for webhook verification)

4. **Features to Implement**
   - [ ] Pro tier subscription ($X/month)
   - [ ] Business tier subscription ($Y/month)
   - [ ] Payment processing API routes
   - [ ] Stripe webhook handler for subscription events
   - [ ] Update user `plan_tier` based on subscription
   - [ ] Subscription management UI in dashboard
   - [ ] Cancel/upgrade/downgrade flows
   - [ ] Invoice generation

5. **Database Updates**
   - [ ] Add `stripe_customer_id` to `users` table
   - [ ] Add `stripe_subscription_id` to `users` table
   - [ ] Add `subscription_status` field
   - [ ] Migration for Stripe-related fields

## 🔐 Authentication (Phase 6 Completion)

### Supabase Auth Setup

- [ ] Enable Email Auth in Supabase dashboard
- [ ] Configure email templates
- [ ] Set up password reset flow
- [ ] Create login/signup pages
- [ ] Implement session management
- [ ] Connect user IDs to event ownership
- [ ] Event claiming functionality
- [ ] Protected dashboard routes

## 📊 Analytics & Monitoring

- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Add analytics (Vercel Analytics, Plausible, or similar)
- [ ] Set up uptime monitoring
- [ ] Database query monitoring
- [ ] Email delivery tracking

## 🎨 UI/UX Enhancements

- [ ] Loading states for all async operations
- [ ] Better error messages
- [ ] Toast notifications
- [ ] Skeleton loaders
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] SEO optimization (meta tags, Open Graph, Twitter cards)

## 🚀 Performance

- [ ] Image optimization (if adding images later)
- [ ] Database query optimization
- [ ] Caching strategy
- [ ] CDN configuration
- [ ] Bundle size optimization

## 📧 Email Improvements

- [ ] Email templates for different events
- [ ] RSVP confirmation emails (optional)
- [ ] Reminder emails (Pro feature)
- [ ] Unsubscribe functionality
- [ ] Email analytics

## 🔒 Security

- [ ] Rate limiting on API routes
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] SQL injection prevention (already using parameterized queries)
- [ ] XSS prevention
- [ ] Content Security Policy headers
- [ ] HTTPS enforcement

## 📈 Pro/Business Features

### Pro Tier Features
- [ ] Custom event slugs (instead of random)
- [ ] CSV export of RSVPs
- [ ] Advanced filtering and search
- [ ] Additional themes
- [ ] Capacity limits and enforcement
- [ ] Guest list visibility controls
- [ ] Email reminders
- [ ] Analytics dashboard

### Business Tier Features
- [ ] Multi-event management
- [ ] Team collaboration
- [ ] White-label options
- [ ] API access
- [ ] Priority support
- [ ] Custom branding

## 🧪 Testing

- [ ] Unit tests for utilities
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows
- [ ] Load testing
- [ ] Security testing

## 📝 Documentation

- [ ] API documentation
- [ ] User guide
- [ ] Organizer guide
- [ ] Developer documentation
- [ ] Terms of Service
- [ ] Privacy Policy

## 🎯 Launch Checklist

- [ ] All critical items above completed
- [ ] Test all flows end-to-end
- [ ] Verify email delivery
- [ ] Test payment processing (Stripe test mode)
- [ ] Load test with realistic data
- [ ] Security audit
- [ ] Legal pages (Terms, Privacy)
- [ ] Support email/contact form
- [ ] Marketing site updates
- [ ] Social media accounts ready
- [ ] Launch announcement prepared

