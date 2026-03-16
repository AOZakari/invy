# INVY Pre-Launch QA Checklist

**Run this on the live site (invy.rsvp) in your browser before advertising.**

Use a **100% discount coupon** in Stripe (e.g. `TEST100`) so you can test Pro/Business flows without real charges.

---

## Setup

- [ ] Create Stripe coupon: 100% off, code `TEST100` (or similar)
- [ ] Migrations applied to production Supabase
- [ ] Resend configured (emails work)
- [ ] `CRON_SECRET` set in Vercel (for reminder cron; optional for basic QA)

---

## 1. Core Flows (Free Tier)

### 1.1 Create Event
- [ ] Go to `/create`
- [ ] Fill: title, date, time, location, organizer email
- [ ] Submit → redirected to `/created?slug=...&adminSecret=...`
- [ ] No custom slug input visible (free tier)
- [ ] Theme dropdown shows only Light / Dark
- [ ] No capacity limit field
- [ ] Organizer receives "Your INVY is ready" email

### 1.2 Public Event Page
- [ ] Visit `/e/[slug]` with your event slug
- [ ] Event details display correctly (title, date, time, location)
- [ ] RSVP form visible (name optional, email required)
- [ ] Status options: Yes / Maybe / No
- [ ] +1 field works
- [ ] No custom RSVP fields (free tier)
- [ ] Add to calendar link works
- [ ] Share button works (native share or copy)
- [ ] Footer shows "Powered by INVY"
- [ ] No guest list visible (host_only default)

### 1.3 RSVP Flow
- [ ] Submit RSVP with email + status
- [ ] Success state shows (add to calendar, share)
- [ ] Guest receives confirmation email
- [ ] Organizer receives "New RSVP" email (if notify_on_rsvp on)

### 1.4 Manage Event (Free)
- [ ] Visit `/manage/[adminSecret]`
- [ ] RSVP list shows submissions
- [ ] Edit event: title, date, time, location, theme (light/dark only)
- [ ] Toggle RSVP open/closed
- [ ] CSV export shows "Upgrade to export CSV" (not functional)
- [ ] No capacity limit in edit form
- [ ] No custom slug field
- [ ] No guest list visibility dropdown
- [ ] No custom RSVP fields section
- [ ] No analytics widget
- [ ] No QR code button
- [ ] Duplicate event works
- [ ] Delete event works (with confirm)

---

## 2. Upgrade to Pro Event (Use TEST100 Coupon)

- [ ] On manage page, click **Upgrade** for Pro Event (€5.99)
- [ ] Stripe Checkout opens
- [ ] Enter coupon `TEST100` → total €0
- [ ] Complete with card `4242 4242 4242 4242`
- [ ] Redirected back to manage page
- [ ] Event shows Pro tier (no "Upgrade" block or different UI)

### 2.1 Pro Features Unlocked

- [ ] **Custom slug:** Edit form has slug field; change to `my-event-2024`; save; visit `/e/my-event-2024` works
- [ ] **Advanced themes:** Theme dropdown shows 8 options (Light, Dark, Ocean, Forest, Sunset, Midnight, Rose, Lavender); change theme; event page reflects it
- [ ] **CSV export:** Export CSV button works; downloads file with Name, Email, Status, +1, Date
- [ ] **Guest list controls:** Dropdown for visibility (host only / everyone / attendees only); set to "Everyone"; public page shows guest list below RSVP form
- [ ] **Capacity limits:** Capacity field in edit form; set to 10; public page shows "X spots left"
- [ ] **Link preview cards:** OG image URL field in edit form; paste image URL; share link on WhatsApp/Twitter shows custom image
- [ ] **Analytics:** Analytics widget on manage page shows page views, RSVP submissions, manage opens (may be 0 initially)
- [ ] **Custom RSVP fields:** Add field (e.g. "Dietary restrictions", type text); save; public RSVP form shows new field; submit RSVP; manage list and CSV include the column
- [ ] **QR code:** "Download QR code" button works; PNG downloads; scan opens event URL

### 2.2 Guest List: Attendees Only
- [ ] Set guest list visibility to "Only attendees can see"
- [ ] Visit event page in incognito → no guest list
- [ ] RSVP in incognito → guest list appears (cookie set)

---

## 3. Upgrade to Pro Event = Business Tier (Use TEST100 Coupon)

**Note:** "Pro Event" (€5.99) sets `plan_tier` to `business`, so it unlocks both Pro and Business features.

- [ ] Upgrade to Pro Event (same as Section 2)
- [ ] Event has Business tier (all Pro + Business features)

### 3.1 Business-Only Features (Share, Reminders, White Label)

- [ ] **Share controls:** "Custom share message" textarea and "Hide INVY branding in share" checkbox in edit form
  - [ ] Set custom message "You're invited!"; use Share on mobile → message appears
  - [ ] Check "Hide INVY branding in share"; share link preview shows event title as site name (not INVY)
- [ ] **Email reminders:** "Send reminder 1 day before" checkbox; enable it (cron will send when event is ~24h away)
- [ ] **White label:** "Hide Powered by INVY on event page and emails" checkbox
  - [ ] Enable; event page footer disappears
  - [ ] RSVP as guest; confirmation email has no INVY footer

---

## 4. Stripe & Billing

### 4.1 Event Upgrades (Keep / Pro Event)
- [ ] Keep (€2.99): Upgrade free event → event stays live past 7 days
- [ ] Pro Event (€5.99): Unlocks all Pro features
- [ ] Use `TEST100` at checkout for €0

### 4.2 Organizer Hub (Subscription)
- [ ] Sign up at `/signup`
- [ ] Dashboard → Billing
- [ ] Subscribe to Organizer Hub (€15.99/month)
- [ ] Use `TEST100` at checkout
- [ ] Billing page shows "Manage subscription"
- [ ] Cancel via Stripe Customer Portal → plan reverts to free

### 4.3 Webhooks
- [ ] Stripe Dashboard → Webhooks → check Events for successful deliveries after each payment

---

## 5. Edge Cases & Polish

### 5.1 Capacity
- [ ] Set capacity to 5; get 5+ yes RSVPs; public page shows "Fully booked"; RSVP form hidden or disabled

### 5.2 Event Expiry
- [ ] Free event: 7 days after start date, page shows "This event has ended"
- [ ] Pro/Business event: Stays live indefinitely

### 5.3 RSVP Closed
- [ ] Toggle RSVPs closed; public page shows "RSVPs are closed"

### 5.4 Custom Slug Uniqueness
- [ ] Create two Pro events; try same custom slug on second → error "This URL is already taken"

### 5.5 Mobile
- [ ] Create event on mobile
- [ ] RSVP on mobile
- [ ] Share via native share sheet
- [ ] Manage page usable on mobile

### 5.6 Emails
- [ ] RSVP confirmation arrives
- [ ] Organizer notification arrives
- [ ] Event created email arrives
- [ ] (If Business + reminder enabled) Reminder email 1 day before (create event for tomorrow to test)

---

## 6. Security & Access

- [ ] `/manage/[wrong-secret]` → 404 or error
- [ ] Cannot edit event without correct admin secret
- [ ] Public event page works without auth

---

## 7. Performance & UX

- [ ] Event page loads quickly
- [ ] Manage page loads quickly
- [ ] No console errors in browser DevTools
- [ ] Forms validate (e.g. invalid email rejected)

---

## Sign-Off

- [ ] All critical paths pass
- [ ] No blocking bugs
- [ ] Ready to advertise

**Date completed:** _______________  
**Tester:** _______________
