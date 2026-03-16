# Manual Steps — Do These Yourself

These steps require your accounts (Namecheap, Vercel, Resend, Stripe) and cannot be automated by code.

---

## 1. Domain: Namecheap + Vercel

**Assumption:** Your domain is `invy.rsvp`.

### Option A: Vercel Nameservers (recommended)

1. **Vercel:** Open your INVY project → **Settings** → **Domains** → **Add**
   - Add `invy.rsvp`
   - Add `www.invy.rsvp`
2. Vercel will show nameservers. Note them:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
3. **Namecheap:** Domain List → your domain → **Manage** → **Nameservers**
   - Select **Custom DNS**
   - Enter `ns1.vercel-dns.com` and `ns2.vercel-dns.com`
   - Save
4. Wait for propagation (up to 48 hours). Vercel will auto-issue SSL.
5. **Vercel:** Project → **Settings** → **Environment Variables**
   - Set `NEXT_PUBLIC_APP_URL` = `https://invy.rsvp` (apex only, no www)
   - Redeploy after adding
6. **www redirect:** The repo includes `vercel.json` that redirects `www.invy.rsvp` → `invy.rsvp`. This fixes blank pages on www and keeps one canonical URL for cookies/auth.

### Option B: Advanced DNS (keep Namecheap DNS)

1. **Vercel:** Add domain, then copy the DNS records shown.
2. **Namecheap:** Domain List → **Manage** → **Advanced DNS**
   - Add **A Record**:
     - Host: `@`
     - Value: `76.76.21.21` (or the IP Vercel shows)
   - Add **CNAME Record**:
     - Host: `www`
     - Value: `cname.vercel-dns.com`
3. **Vercel:** Click **Verify** on the domain.
4. Set `NEXT_PUBLIC_APP_URL` as above.

---

## 2. Resend: Email Domain Verification

Emails use `noreply@invy.rsvp` and `contact@invy.rsvp`. Resend must verify the domain.

1. **Resend:** [resend.com](https://resend.com) → **Domains** → **Add Domain**
   - Enter `invy.rsvp`
2. Resend will show DNS records (SPF, DKIM). Copy them.
3. **Namecheap:** Domain → **Manage** → **Advanced DNS**
   - Add each **TXT** record Resend provides (Host and Value)
   - Add any **CNAME** records Resend provides
4. **Resend:** Click **Verify**. Wait for DNS propagation if needed.
5. Ensure `lib/emails/resend.ts` uses `from: 'INVY <noreply@invy.rsvp>'` (or your verified domain).

---

## 3. Stripe: Account, Products, and PayPal

### 3.1 Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com).
2. Complete business verification (required for live).
3. Go to **Developers** → **API keys**. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### 3.2 Enable PayPal

1. **Stripe Dashboard** → **Settings** → **Payment methods** → **PayPal**
2. Connect your PayPal Business account.
3. PayPal will appear in Checkout when `payment_method_types` includes `paypal`.

### 3.3 Create Products and Prices

1. **Stripe Dashboard** → **Products** → **Add product**

   **Product 1: Keep**
   - Name: `Keep`
   - Description: `Keep your event live longer. One-off.`
   - Pricing: **One-time** → €2.99 (EUR)
   - Copy the **Price ID** (e.g. `price_xxx`) → `STRIPE_KEEP_PRICE_ID`

   **Product 2: Pro Event**
   - Name: `Pro Event`
   - Description: `Pro features for a single event. One-off.`
   - Pricing: **One-time** → €5.99 (EUR)
   - Copy the **Price ID** → `STRIPE_PRO_EVENT_PRICE_ID`

   **Product 3: Organizer Hub**
   - Name: `Organizer Hub`
   - Description: `Pro + Business features on all your events. Subscription.`
   - Pricing: **Recurring** → €15.99/month (EUR)
   - Copy the **Price ID** → `STRIPE_ORGANIZER_HUB_PRICE_ID`

### 3.4 Webhook

1. **Stripe Dashboard** → **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://invy.rsvp/api/stripe/webhook` (replace with your domain)
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 3.5 Add to Vercel

In **Vercel** → Project → **Settings** → **Environment Variables**, add:

| Name | Value |
|------|-------|
| `STRIPE_SECRET_KEY` | sk_live_xxx |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_live_xxx |
| `STRIPE_KEEP_PRICE_ID` | price_xxx |
| `STRIPE_PRO_EVENT_PRICE_ID` | price_xxx |
| `STRIPE_ORGANIZER_HUB_PRICE_ID` | price_xxx |
| `STRIPE_WEBHOOK_SECRET` | whsec_xxx |

Add these for **Production** (and preview if you want test mode there). Redeploy after adding.

---

## 4. Assets: Favicon and OG Image

The app needs these files in `public/`:

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 32x32 or 48x48 | Browser tab icon |
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `og-image.png` | 1200x630 | Social share image (Instagram, Twitter, etc.) |

**OG image:** Include INVY branding and tagline (e.g. "Collect RSVPs in seconds"). Use Canva, Figma, or similar.

**Placeholder:** If you prefer, the code can use a default or skip the OG image until you have one. Say so when you validate.

---

## 5. Contact Email

Emails reference `contact@invy.rsvp` for support.

1. **Namecheap:** Domain → **Manage** → **Advanced DNS**
   - Add **MX** records if you want to receive mail on the domain (e.g. Google Workspace, Zoho, or Namecheap Private Email).
2. Or set up **Email forwarding** in Namecheap: `contact@invy.rsvp` → your personal email.

---

## 6. Supabase Auth (if not done)

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
   - **Site URL:** `https://invy.rsvp` (apex only; www redirects to apex)
   - **Redirect URLs:** Add `https://invy.rsvp/**`, `https://invy.rsvp/dashboard`, `https://invy.rsvp/auth/callback`
2. **Authentication** → **Providers** → **Email**
   - Turn **off** "Confirm email" if you want signup without confirmation emails (until you have custom SMTP).

---

## Checklist

- [ ] Domain added in Vercel
- [ ] Namecheap nameservers or DNS updated
- [ ] `NEXT_PUBLIC_APP_URL` set in Vercel
- [ ] Resend domain verified
- [ ] Stripe account created
- [ ] PayPal connected in Stripe
- [ ] Three Stripe products/prices created
- [ ] Webhook endpoint added in Stripe
- [ ] All Stripe env vars in Vercel
- [ ] Favicon and OG image in `public/` (or placeholder)
- [ ] Contact email set up
- [ ] Supabase auth URLs updated
- [ ] **Supabase Storage:** Create bucket `event-images` (public) for Pro cover/poster images. Storage → New bucket → name `event-images`, Public bucket = Yes.
