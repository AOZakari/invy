# INVY Pre-Launch Audit Report

**Date:** March 11, 2025  
**Audit scope:** Full codebase inspection against pre-launch checklist  
**Method:** Codebase review, no assumptions

---

## A. IMPLEMENTED NOW

### Core Product Loop
- **Create event in seconds:** `app/create/page.tsx`, `components/CreateEventForm.tsx`, `app/api/events/route.ts` — single form, no signup, one API call → redirect to `/created`
- **Event page (mobile + desktop):** `app/e/[slug]/page.tsx`, `components/EventPageContent.tsx` — responsive layout (`flex-col sm:flex-row`, `md:pt-16`, etc.)
- **Link sharing:** `components/EventPageActions.tsx` — Add to calendar (ICS), Share (Web Share API or copy), custom share message
- **Guest RSVP / request:** `components/RsvpForm.tsx` — instant (yes/maybe/no) or request mode ("Request to join")
- **Organizer management:** `app/manage/[adminSecret]/page.tsx`, `components/AdminEventView.tsx` — edit, toggle RSVP open/closed, CSV export, QR, duplicate, delete
- **Follow-up emails:** `lib/emails/resend.ts` — RSVP confirmation, request received, approved, declined, event created, organizer notification

### Free Flow Simplicity
- **No signup wall:** Create is anonymous; only organizer email required (`app/create/page.tsx`)
- **No giant setup form:** Single form with title, date, time, location, organizer email, optional details
- **No forced customization:** Theme defaults to light; advanced options hidden for free tier
- **No aggressive upsell:** Upgrade section only on manage page, below main content

### Pricing / Upgrade Ladder
- **Four tiers:** Free, Plus (€2.99/event), Pro Event (€5.99/event), Organizer Hub (€15.99/month) — `lib/pricing.ts`, `types/database.ts` MVP_PRICING
- **Pricing page:** `app/pricing/page.tsx` — plans, comparison table, FAQ
- **Upgrade prompts:** Manage page shows Plus and Pro Event cards with "Upgrade" — `components/AdminEventView.tsx:989–1032`
- **"Keep" renamed to "Plus":** Plan name is "Plus" in UI; eyebrow "Keep it live" retained — `lib/pricing.ts`, `AdminEventView.tsx` uses `MVP_PRICING.plus.label`
- **Feature gating:** `lib/permissions/features.ts`, `lib/permissions/capabilities.ts` — Plus (keep_live) gets csv_export, qr_code, 1 custom field; Pro gets full Pro features; Hub gets share_controls, email_reminders, white_label

### Pro Visual Value
- **Cover image:** `AdminEventView.tsx` ImageUploadField, `EventPageContent.tsx` hero with cover
- **Poster image:** Same upload flow; floating or card treatment per page style
- **Page styles:** Classic / Modern / Bold — `lib/utils/presets.ts`, `getPageStylePreset`
- **8 themes:** Light, dark, ocean, forest, sunset, midnight, rose, lavender — `lib/utils/themes.ts`
- **OG/share preview:** `app/e/[slug]/page.tsx` generateMetadata, `og_image_url` or `cover_image_url` or default

### Approval Mode / Request-to-Attend
- **RSVP mode toggle:** Instant vs Request — `AdminEventView.tsx:718–746`
- **Guest statuses:** pending, approved, declined — `lib/db/rsvps.ts`, `RsvpListWithApproval.tsx`
- **Guest-facing copy:** "Request to join" — `RsvpForm.tsx:78`
- **Organizer actions:** Approve/Decline per row, bulk approve/decline — `RsvpListWithApproval.tsx`, `app/api/manage/events/[eventId]/rsvps/`
- **Hidden details:** `hide_location_until_approved`, `hide_private_note_until_approved`, `private_note` — `EventPageContent.tsx:54–55`, `app/api/events/[slug]/approve/route.ts`
- **Emails:** Request received, approved (with approval token link), declined — `lib/emails/resend.ts`

### Organizer Management
- **Filters:** Pending, Approved, Declined, All — `RsvpListWithApproval.tsx:134–148`
- **Guest list rows:** Name, contact, status, +1, custom fields, date — `RsvpListWithApproval.tsx:186–261`
- **Row actions:** Approve, Decline — `RsvpListWithApproval.tsx:234–254`
- **Bulk approve/decline:** With capacity check — `app/api/manage/events/[eventId]/rsvps/bulk/route.ts`
- **Select all visible:** Checkbox in pending tab — `RsvpListWithApproval.tsx:186`
- **Remaining spots:** Shown when capacity enabled — `RsvpListWithApproval.tsx:153–157`
- **Over-approval prevention:** Bulk approve checks capacity before updating — `bulk/route.ts:61–70`

### Email Flow
- **RSVP received:** `sendRsvpConfirmationEmail` (instant) or `sendRequestReceivedEmail` (request)
- **Approved:** `sendRequestApprovedEmail` with optional approval token
- **Declined:** `sendRequestDeclinedEmail`
- **Reminder:** `sendReminderEmail` (1 day before) — `app/api/cron/reminders/route.ts`
- **Event created:** `sendEventCreatedEmail`
- **Organizer notification:** `sendOrganizerRsvpEmail`

### Privacy Controls
- **Guest list visibility:** host_only, public, attendees_only — `AdminEventView.tsx:702–716`, `EventPageContent.tsx`, `PublicGuestList.tsx`
- **Hidden details until approved:** Location, private note — `EventPageContent.tsx:54–55`, `invy_approved` cookie

### Shareability / Preview
- **OG metadata:** `generateMetadata` in `app/e/[slug]/page.tsx` — title, description, ogImage, siteName
- **QR code:** `GET /api/events/[slug]/qr` — PNG, feature-gated in manage UI
- **Custom slug:** Pro/Business only
- **Share controls:** Custom message, hide branding in share — Business only

### Analytics
- **Metrics:** page_view, rsvp, manage_open — `lib/db/analytics.ts`, `app/api/analytics/record/route.ts`
- **Instrumentation:** `RecordPageView` → page_view; RSVP API → rsvp; `RecordManageView` → manage_open
- **Widget:** `AnalyticsWidget.tsx` on manage page (Pro/Business)

### DB Schema
- **Events:** All fields including rsvp_mode, hide_location_until_approved, hide_private_note_until_approved, private_note, page_style, cover_image_url, poster_image_url — `supabase/migrations/`, `types/database.ts`
- **RSVPs:** status (yes, no, maybe, pending, approved, declined), custom_field_values

### Copy Quality
- "Keep it live" (Plus eyebrow) — `lib/pricing.ts`
- "Request to join" — `RsvpForm.tsx:78`
- "The organizer will review it and confirm your spot" — `RsvpForm.tsx:295`
- "Location shared after approval" — `EventPageContent.tsx`
- "Save your page" — `AdminEventView.tsx:993`
- "For repeat hosts" — `lib/pricing.ts` Organizer Hub badge

---

## B. PARTIALLY IMPLEMENTED

### 1. Capacity enforcement on instant RSVP
- **Exists:** UI hides form when fully booked; approval flow checks capacity before approve
- **Missing:** `POST /api/rsvps` does not enforce capacity before creating an instant RSVP
- **Why partial:** Race conditions or direct API calls can exceed capacity for Pro/Business events
- **Files:** `app/api/rsvps/route.ts` — no capacity check before `createRsvp`

### 2. Reminder emails for approved request-mode guests
- **Exists:** Reminder cron sends to `yes` and `maybe` status
- **Missing:** `approved` status (request-mode confirmed guests) is excluded
- **Why partial:** `app/api/cron/reminders/route.ts:42` — `if (rsvp.status !== 'yes' && rsvp.status !== 'maybe') continue` — skips `approved`
- **Files:** `app/api/cron/reminders/route.ts`

### 3. Analytics instrumentation for upgrades
- **Exists:** page_view, rsvp, manage_open tracked
- **Missing:** upgrade_started, upgrade_completed not instrumented
- **Why partial:** Checklist asks for upgrade funnel metrics; not implemented
- **Files:** `app/api/stripe/checkout/route.ts`, `app/api/stripe/webhook/route.ts` — no analytics calls

### 4. Organizer Hub price consistency
- **Exists:** `lib/pricing.ts` and `types/database.ts` MVP_PRICING show €15.99/month
- **Missing:** `PRE_LAUNCH_QA_CHECKLIST.md` line 104 says "€9.99/month" — outdated
- **Files:** `PRE_LAUNCH_QA_CHECKLIST.md`

---

## C. MISSING BEFORE LAUNCH

1. **Server-side capacity check on RSVP creation** — `app/api/rsvps/route.ts` must reject instant RSVPs when at/over capacity for Pro/Business events
2. **Reminder emails for approved guests** — `app/api/cron/reminders/route.ts` must include `status === 'approved'` in the send condition
3. **PRE_LAUNCH_QA_CHECKLIST.md update** — Fix Organizer Hub price (€15.99) and any other stale references

---

## D. NICE TO HAVE / POST-LAUNCH

- Demo/example event page (no `/e/demo` or similar exists; not critical)
- Upgrade funnel analytics (upgrade_started, upgrade_completed)
- Marketing screenshots on pricing/landing (current copy is sufficient)
- Richer organizer branding beyond white label

---

## E. DO NOT BUILD NOW

- Ticketing
- Discovery feed
- Promoter tools
- CRM
- Team permission complexity
- Giant dashboards
- Page builder / Elementor-like editing

**Current state:** Product stays lean. No obvious bloat. Admin panel (`app/admin/`) exists but is superadmin-only; not exposed to regular users.

---

## F. GAPS / RISKS

### Trust & Reliability
1. **Capacity bypass:** Instant RSVP API does not enforce capacity; organizer could be surprised by over-booking
2. **Approved guests miss reminders:** Request-mode approved guests do not receive 1-day-before reminder emails

### UX
3. **Request-mode success state:** In request mode, success state does not show Add to calendar / Share (by design — guest not yet confirmed). Acceptable.

### Product
4. **Tier naming complexity:** `plan_tier` (free/pro/business) vs `keep_live` vs product names (Free/Plus/Pro/Hub) — mapping is implicit; works but could confuse future contributors
5. **`(event as any)` casts:** Used for `page_style`, `rsvp_mode`, `hide_location_until_approved`, etc. — types could be extended for clarity

### Bloat Risk
6. **Low:** No giant settings panels, no section builders, no CRM drift. Admin panel is minimal.

---

## G. RECOMMENDED IMPLEMENTATION PLAN

### Phase 1 — Launch-critical (1–2 hours)
| Task | Why | Dependencies | Launch-critical |
|------|-----|--------------|------------------|
| Add capacity check to `POST /api/rsvps` | Prevents over-booking; organizer trust | None | Yes |
| Include `approved` in reminder cron | Approved guests get reminders | None | Yes |
| Update PRE_LAUNCH_QA_CHECKLIST.md | Correct Organizer Hub price | None | No (doc only) |

### Phase 2 — Post-launch (optional)
| Task | Why | Dependencies |
|------|-----|--------------|
| Instrument upgrade_started / upgrade_completed | Funnel metrics | None |
| Add demo event link on landing | Conversion | None |
| Extend Event type for rsvp_mode, page_style, etc. | Type safety | None |

---

## H. FILES / SYSTEMS TO TOUCH

| Change | Files |
|--------|-------|
| Capacity check on RSVP | `app/api/rsvps/route.ts` — before `createRsvp`, fetch event capacity_limit and stats; reject if at/over |
| Reminder for approved | `app/api/cron/reminders/route.ts` — change line 42 to include `rsvp.status === 'approved'` |
| QA checklist | `PRE_LAUNCH_QA_CHECKLIST.md` — line 104: €9.99 → €15.99 |

---

## I. OPEN QUESTIONS / ASSUMPTIONS

1. **Stripe price IDs:** Assumed `STRIPE_KEEP_PRICE_ID`, `STRIPE_PRO_EVENT_PRICE_ID`, `STRIPE_ORGANIZER_HUB_PRICE_ID` are set in env; not verified in codebase
2. **Reminder cron:** `getEventsForReminders` filters `plan_tier = 'business'` only — so only Organizer Hub events get reminders. Pro Event (one-time) does not. Assumed intentional per feature matrix
3. **Capacity for Plus:** Plus (keep_live) does not get capacity_limits. Only Pro/Business. Assumed intentional

---

## Summary

**Implemented:** ~95% of pre-launch checklist. Core loop, pricing, approval mode, emails, themes, share, analytics, and organizer tools are in place.

**Launch blockers:** 2 — (1) server-side capacity enforcement on RSVP, (2) reminder emails for approved request-mode guests.

**Post-launch:** Upgrade analytics, demo page, type cleanup.

**Bloat status:** Safe. Product remains lean and focused.
