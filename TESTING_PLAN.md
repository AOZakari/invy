# INVY Testing Plan — No Real Payments

Test all features and Stripe flows using **test mode**. No real charges.

---

## Testing on Production (invy.rsvp / Vercel)

Use this when you want to test on the **deployed** site (not localhost).

### Option A: 100% Discount Coupon (Simplest)

1. **Stripe Dashboard** (Live mode) → **Products** → **Coupons** → **Create coupon**
   - Name: `TEST100` (or similar)
   - Type: **Percentage discount** → 100%
   - Duration: **Once** (for one-time) or **Forever** (for subscription)
   - Create a **Promotion code** from the coupon (e.g. code `TEST100`)

2. At checkout, click **Add promotion code** and enter `TEST100`.

3. Payment becomes €0 — webhooks still fire, flow is identical. No env var changes.

### Option B: Switch to Stripe Test Mode

- **Back up your live Stripe env vars** — you'll switch back after testing.
- **No real users yet** — while on test keys, all payments are fake. Don't do this if real users are paying.

### Step-by-step

1. **Stripe Dashboard** → toggle **Test mode** (top right).

2. **Create test products** (if not already done):
   - Keep (€2.99 one-time)
   - Pro Event (€5.99 one-time)
   - Organizer Hub (€9.99/month)
   - Copy each **Price ID** (test mode IDs).

3. **Get test API keys** → **Developers** → **API keys**:
   - Publishable: `pk_test_xxx`
   - Secret: `sk_test_xxx`

4. **Add test webhook** → **Developers** → **Webhooks** → **Add endpoint**:
   - URL: `https://invy.rsvp/api/stripe/webhook` (your production URL)
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Signing secret** (`whsec_xxx`)

5. **Vercel** → Project → **Settings** → **Environment Variables** → **Production**:
   - Update (or add) these with **test** values:

   | Name | Value |
   |------|-------|
   | `STRIPE_SECRET_KEY` | `sk_test_xxx` |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxx` |
   | `STRIPE_KEEP_PRICE_ID` | `price_xxx` (test) |
   | `STRIPE_PRO_EVENT_PRICE_ID` | `price_xxx` (test) |
   | `STRIPE_ORGANIZER_HUB_PRICE_ID` | `price_xxx` (test) |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_xxx` (from test webhook) |

6. **Redeploy** → **Deployments** → latest → **⋯** → **Redeploy**

7. **Test** on https://invy.rsvp using card `4242 4242 4242 4242`.

8. **Switch back to live** when done:
   - Restore live Stripe keys and price IDs in Vercel Production
   - Restore live webhook signing secret
   - Redeploy again

---

## Step 1: Stripe Test Mode Setup (Detailed)

### 1.1 Create Test Products in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → toggle **Test mode** (top right).
2. **Products** → **Add product** (same as production, but in test mode):

   **Product 1: Keep**
   - Name: `Keep`
   - Description: `Keep your event live longer. One-off.`
   - Pricing: **One-time** → €2.99 (EUR)
   - Copy the **Price ID** (starts with `price_xxx`)

   **Product 2: Pro Event**
   - Name: `Pro Event`
   - Description: `Pro features for a single event. One-off.`
   - Pricing: **One-time** → €5.99 (EUR)
   - Copy the **Price ID**

   **Product 3: Organizer Hub**
   - Name: `Organizer Hub`
   - Description: `All events, reminders, and more. Subscription.`
   - Pricing: **Recurring** → €9.99/month (EUR)
   - Copy the **Price ID**

### 1.2 Get Test API Keys

1. **Developers** → **API keys** (while in Test mode).
2. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 1.3 Webhook for Test Mode

**Option A: Local (Stripe CLI)**

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret (starts with `whsec_`) and add to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

**Option B: Vercel Preview**

1. In Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://YOUR-PREVIEW-DEPLOYMENT.vercel.app/api/stripe/webhook` (or use a test branch URL)
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the **Signing secret** → add to Vercel **Preview** env vars for that deployment

### 1.4 Environment Variables

**For local testing** (`.env.local`):

```env
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_KEEP_PRICE_ID=price_xxx
STRIPE_PRO_EVENT_PRICE_ID=price_xxx
STRIPE_ORGANIZER_HUB_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Vercel Preview** (optional): Add the same env vars to **Preview** environment in Vercel project settings.

---

## Step 2: Stripe Test Cards

| Card number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | Requires 3D Secure |

Use any future expiry (e.g. 12/34), any 3-digit CVC, any ZIP.

---

## Step 3: Feature Test Checklist

### 3.1 Event Creation (No Auth)

- [ ] Go to `/create`
- [ ] Fill: title, date, time, location, email
- [ ] Submit → redirected to `/created?slug=...&adminSecret=...`
- [ ] Check email for manage link (if Resend configured)
- [ ] Copy link works (WhatsApp share)

### 3.2 Public Event Page

- [ ] Visit `/e/[slug]` with event slug
- [ ] Page shows event details
- [ ] RSVP form visible
- [ ] Add to calendar works
- [ ] Share button works

### 3.3 RSVP Flow

- [ ] Enter email (required), name (optional)
- [ ] Choose Going / Maybe / Not going
- [ ] Submit → confirmation shown
- [ ] Check email for confirmation (if Resend configured)
- [ ] Organizer gets email (if notify_on_rsvp enabled)

### 3.4 Manage Event (Admin)

- [ ] Visit `/manage/[adminSecret]`
- [ ] View RSVP list
- [ ] Edit event (title, date, location, etc.)
- [ ] Toggle RSVP open/closed
- [ ] Duplicate event → new event created
- [ ] Export CSV
- [ ] Delete event (confirm)

### 3.5 Upgrade: Keep (Event)

- [ ] On manage page for a **free** event, find "Upgrade" block
- [ ] Click **Upgrade** for Keep (€2.99)
- [ ] Redirected to Stripe Checkout
- [ ] Use test card `4242 4242 4242 4242`
- [ ] Complete payment → redirected to `/manage/[adminSecret]?upgraded=true`
- [ ] Event shows upgraded (Keep tier)
- [ ] Event does not expire 7 days after date

### 3.6 Upgrade: Pro Event (Event)

- [ ] On manage page for a **free** event, find Pro Event upgrade
- [ ] Click **Upgrade** for Pro Event (€5.99)
- [ ] Stripe Checkout → test card
- [ ] Complete → redirected back
- [ ] Event shows Pro tier

### 3.7 Organizer Hub (Subscription)

- [ ] Sign up or log in at `/signup` or `/login`
- [ ] Go to dashboard → **Billing** (`/dashboard/billing`)
- [ ] Click **Subscribe** for Organizer Hub (€9.99/month)
- [ ] Stripe Checkout → test card
- [ ] Complete → redirected to `/dashboard/billing?success=true`
- [ ] Billing page shows "Manage subscription"
- [ ] **Webhook** updates `plan_tier` to `pro` in `users` table

### 3.8 Billing Portal

- [ ] As Organizer Hub subscriber, click **Manage subscription**
- [ ] Stripe Customer Portal opens
- [ ] Cancel subscription (or update payment method)
- [ ] **Webhook** `customer.subscription.deleted` fires → `plan_tier` back to `free`

### 3.9 Claim Events (Optional)

- [ ] Create event with email (no account)
- [ ] Sign up with same email
- [ ] Dashboard → claim events

---

## Step 4: Webhook Verification

1. **Stripe Dashboard** → **Developers** → **Webhooks** → your endpoint
2. Check **Events** tab for successful deliveries
3. Or use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook` and watch logs

### Expected events

| Event | When | Effect |
|-------|------|--------|
| `checkout.session.completed` | After successful payment | Updates `events.plan_tier` or `users.plan_tier` |
| `customer.subscription.updated` | Subscription status change | Updates `users.subscription_status` |
| `customer.subscription.deleted` | Subscription canceled | Sets `users.plan_tier` to `free` |

---

## Step 5: Quick Test Run (Local)

```bash
# Terminal 1: Start app
npm run dev

# Terminal 2: Forward webhooks (if testing payments)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

1. Create event → RSVP → manage
2. Upgrade Keep → test card
3. Sign up → Subscribe Organizer Hub → test card
4. Manage subscription → cancel

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Webhook not firing | Check `STRIPE_WEBHOOK_SECRET` matches Stripe CLI or dashboard |
| Checkout redirects to wrong URL | Set `NEXT_PUBLIC_APP_URL` correctly for your env |
| "Invalid request" on checkout | Ensure `eventId`/`adminSecret` match for event upgrades |
| Organizer Hub requires sign-in | Sign up at `/signup` first |
| Plan tier not updating | Check webhook logs; ensure Supabase `users`/`events` tables exist |

---

## Summary

- **Stripe:** Use test keys, test prices, test webhook
- **Cards:** `4242 4242 4242 4242` for success
- **Production:** Temporarily set Vercel Production env vars to test values → redeploy → test → switch back
- **Local:** Stripe CLI + `.env.local` with test vars
- **Preview:** Deploy branch, add test webhook URL + preview env vars
