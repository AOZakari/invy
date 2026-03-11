# INVY MVP — Codebase Audit & Implementation Brief

**Purpose:** Structured audit and implementation plan for the next build pass. No implementation in this document; this is the reference for a second-pass builder.

---

# 1. Executive Summary

**What the current INVY codebase already does well**
- **Core loop is implemented:** Anonymous event creation (no signup), public event page, RSVP (yes/maybe/no), manage view via `admin_secret` URL, and organizer email with manage link after creation.
- **Tech choices are solid:** Next.js 16 App Router, Supabase (PostgreSQL), Resend for email, Zod validation, Tailwind. TypeScript types and DB schema are largely aligned.
- **Dual access model exists:** Organizers can use the app without an account (magic link in email) or sign up and claim events; dashboard and manage-by-secret coexist.
- **Email and logging:** Event-created, RSVP confirmation, and organizer RSVP notification emails exist; email_logs and error_logs tables are in place.

**Biggest product gaps**
- **Landing page:** Minimal (hero + two highlights + CTA). No “how it works,” benefits, FAQ, or trust/privacy.
- **Creation form:** Missing optional end time, max capacity, RSVP deadline, cover image/theme selection beyond light/dark. Schema has `capacity_limit` but it is not used in create form or API.
- **Success screen:** Has copy/preview; missing explicit “manage link sent by email” and **Share to WhatsApp**.
- **Public event page:** No OG/social metadata, no add-to-calendar on page (only after RSVP), no share button above the fold, no capacity/spots-left, no explicit “expired” state.
- **RSVP:** Name is required; MVP asks for email required / name optional. No attendee “magic link” for editing response (confirmation email only). Flow is otherwise aligned (going/maybe/not going, no account).
- **Organizer management:** Edit event and RSVP list exist. Missing: **open/close RSVPs**, **duplicate event**, **CSV export**, **delete event**, and a clear **upgrade placeholder**.
- **Lifecycle/retention:** No event expiry (e.g. 7 days after event), no attendee data retention (e.g. 30 days), no cron/background jobs.
- **Monetization:** Billing page and types exist; no Stripe. MVP asks for scaffolding for Keep (€2.99/event), Pro Event (€5.99/event), Organizer Hub (€9.99/mo) — current billing is Pro/Business monthly only.

**Is the codebase good enough to evolve?**
Yes. The app is coherent, the data model is close to the target, and the product thesis (no-signup-first, manage via email link) is already implemented. No full rewrite is needed.

**Recommended strategy**
- **Reuse:** Event creation API, manage-by-secret, email sending, RSVP API, `AdminEventView`, `RsvpForm`, DB layer, validations, Resend/Supabase setup.
- **Refactor/extend:** Landing page, create form (add fields and optional UI), created success page (WhatsApp, copy), public event page (metadata, share, add-to-calendar, capacity, expiry), manage view (duplicate, delete, CSV, open/close RSVP, upgrade placeholder).
- **Add net-new:** Schema/columns for `ends_at`, `rsvp_deadline`, `rsvp_open`, `expires_at` (or derived); lifecycle job (cron/scheduled); billing scaffolding for the three MVP products (data model + UI placeholders only).

---

# 2. Current Stack and Architecture

**Stack**
- **Framework:** Next.js 16 (App Router).
- **Routing:** App Router file-based (`app/**`).
- **Backend/Data:** Supabase (PostgreSQL) via `@supabase/supabase-js`; server-side uses service role in `lib/supabase/server.ts`, client uses anon key in `lib/supabase/client.ts`.
- **Auth:** Supabase Auth (email/password). Session in `lib/auth/session.ts`, user record sync in `lib/auth/user.ts` and `lib/db/users.ts`. No magic-link auth for organizers; manage link is a secret in the URL, not a token.
- **Email:** Resend in `lib/emails/resend.ts`; logging in `lib/logging/emails.ts`.
- **Storage:** None (no S3/image upload yet).
- **Deployment:** Assumed Vercel (README, VERCEL_DEPLOY.md, PRODUCTION_CHECKLIST.md).
- **Styling:** Tailwind CSS; `app/globals.css` with CSS variables; `tailwind.config.ts` extends `background`/`foreground`.
- **Forms/state:** No form library; raw `FormData`/`useState` in client components. Zod in `lib/validations/`.
- **Analytics:** None in codebase.
- **Payments:** `lib/stripe/client.ts` and `lib/stripe/types.ts` are placeholders (no `stripe` package); no live billing.

**Structure**
- **App/route folders:** `app/` (page.tsx, layout.tsx), `app/create/`, `app/created/`, `app/e/[slug]/`, `app/manage/[adminSecret]/`, `app/login/`, `app/signup/`, `app/dashboard/` (with layout), `app/dashboard/claim/`, `app/dashboard/events/`, `app/dashboard/events/[eventId]/`, `app/dashboard/billing/`, `app/dashboard/settings/`, `app/admin/` (layout + overview, users, events, rsvps, logs, search).
- **Shared components:** `components/` — `RsvpForm`, `RsvpList`, `AdminEventView`, `EventStats`, `CopyButton`, `DashboardNav`, `AdminNav`, `EventsList`, `DashboardOverview`, `ClaimEventsForm`, `UserActions`.
- **Utilities/services:** `lib/db/events.ts`, `lib/db/rsvps.ts`, `lib/db/users.ts`; `lib/emails/resend.ts`; `lib/utils/slug.ts`, `lib/utils/secrets.ts`, `lib/utils/ics.ts`, `lib/utils/cn.ts`; `lib/auth/session.ts`, `lib/auth/user.ts`; `lib/permissions/capabilities.ts`, `lib/permissions/features.ts`; `lib/logging/emails.ts`, `lib/logging/errors.ts`.
- **API routes:** `app/api/events/route.ts` (POST create), `app/api/events/[slug]/route.ts` (GET public event), `app/api/events/claim/route.ts` (POST, auth); `app/api/rsvps/route.ts` (POST); `app/api/manage/events/[eventId]/route.ts` (PATCH); admin: `app/api/admin/users/[userId]/plan/route.ts`, `app/api/admin/users/[userId]/role/route.ts`, `app/api/admin/search/route.ts`.
- **DB/migrations:** `supabase/migrations/` — `001_initial_schema.sql`, `002_add_notify_on_rsvp.sql`, `003_add_user_role_and_stripe.sql`, `004_add_custom_rsvp_fields.sql`, `005_add_logging_tables.sql`.
- **Config/env:** No `.env.example` in repo. README and PRODUCTION_CHECKLIST list: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`; optional `SUPER_ADMIN_EMAIL`.

---

# 3. Route and Screen Audit

| Route/Path | Purpose | Current quality | Reuse? | Exact issues |
|------------|---------|-----------------|--------|----------------|
| `/` | Landing | Minimal hero, 2 highlights, CTA | Reusable with refactor | No “how it works,” benefits, FAQ, trust/privacy. |
| `/create` | Event creation form | Functional, clear layout | Reusable with refactor | Missing: end time, capacity, RSVP deadline, cover/theme beyond light/dark. |
| `/created` | Post-create success | Public + manage URLs, copy, preview | Reusable with refactor | Missing: “Manage link sent by email” emphasis, Share to WhatsApp. Links to `/dashboard` (optional for anonymous). |
| `/e/[slug]` | Public event page | Readable, theme-aware, RSVP form | Reusable with refactor | No generateMetadata/OG; no add-to-calendar on page; no share button; no capacity/spots left; no expired state. |
| `/e/[slug]/not-found` | Event not found | Simple message + home link | Reuse as-is | — |
| `/manage/[adminSecret]` | Organizer manage by link | Full manage UI (links, stats, edit, RSVP list) | Reusable with refactor | Missing: open/close RSVP, duplicate, CSV export, delete, upgrade placeholder. |
| `/manage/[adminSecret]/not-found` | Invalid manage link | Clear message | Reuse as-is | — |
| `/login` | Sign in | Email/password, redirect to dashboard | Reuse as-is | — |
| `/signup` | Create account | Email/password, optional confirm | Reuse as-is | — |
| `/dashboard` | User dashboard | Overview + events list | Reuse as-is | Nav doesn’t surface Claim/Billing/Settings (URL-only). |
| `/dashboard/claim` | Claim events by email | List unclaimed by organizer email, claim | Reuse as-is | — |
| `/dashboard/events` | User’s events | List with stats, View/Manage | Reuse as-is | — |
| `/dashboard/events/[eventId]` | Manage single event (auth) | Wraps AdminEventView with ownership check | Reuse as-is | Same feature gaps as manage view. |
| `/dashboard/billing` | Billing/plans | Shows plan, Pro/Business cards, “Coming soon” | Reusable with refactor | Links to `/dashboard/billing/upgrade` (route does not exist). Align with MVP tiers (Keep/Pro Event/Hub). |
| `/dashboard/settings` | Account/settings | Email, plan, placeholder notifications | Reuse as-is | — |
| `/admin` | Super-admin overview | Counts (users, events, RSVPs, plan distro) | Reuse as-is | — |
| `/admin/users` | User list + role/plan | Uses UserActions | Reuse as-is | — |
| `/admin/events` | All events table | Links to event/manage | Reuse as-is | — |
| `/admin/rsvps` | RSVP list (admin) | — | Inspect | — |
| `/admin/search` | Admin search | — | Inspect | — |
| `/admin/logs` | Logs (errors/emails?) | — | Inspect | — |

---

# 4. Component Audit

| Component | File | What it does | Reuse? | What to change |
|-----------|------|--------------|--------|----------------|
| **RsvpForm** | `components/RsvpForm.tsx` | Name, contact_info, status (yes/maybe/no), +1; POST to `/api/rsvps`; success state with add-to-calendar + share | Reuse with refactor | Make name optional, contact_info = email required; add WhatsApp share in success; consider “edit my RSVP” link from email later. |
| **AdminEventView** | `components/AdminEventView.tsx` | Quick links (public/manage), EventStats, edit event form, RsvpList | Reuse with refactor | Add: duplicate event, delete event, CSV export, “RSVP open/closed” toggle, upgrade CTA/placeholder. |
| **RsvpList** | `components/RsvpList.tsx` | Table of RSVPs (name, contact, status, +1, date) | Reuse | Add CSV export trigger (or use from parent). |
| **EventStats** | `components/EventStats.tsx` | Total, yes, maybe, no, estimated guests | Reuse | Optional: show “spots left” when capacity_limit set. |
| **CopyButton** | `components/CopyButton.tsx` | Copy text to clipboard, “Copied” feedback | Reuse | — |
| **DashboardNav** | `components/DashboardNav.tsx` | INVY, Dashboard, Events, Create, Admin (if superadmin), email, Sign out | Reuse | Optional: add Claim, Billing, Settings for discoverability. |
| **EventsList** | `components/EventsList.tsx` | Server list of user events with stats, View/Manage | Reuse | — |
| **DashboardOverview** | `components/DashboardOverview.tsx` | Three cards: total events, total RSVPs, upcoming | Reuse | — |
| **ClaimEventsForm** | `components/ClaimEventsForm.tsx` | List unclaimed events, claim one or all via API | Reuse | — |
| **UserActions** | `components/UserActions.tsx` | Admin: change plan_tier and role (dropdowns) | Reuse | — |
| **AdminNav** | `components/AdminNav.tsx` | Admin nav + link to dashboard | Reuse | — |

**Missing for MVP**
- Landing: sections for “how it works,” benefits, FAQ, trust/privacy (can be new components or sections in `app/page.tsx`).
- Created page: WhatsApp share button (reuse existing copy/share pattern).
- Public event page: share button component and add-to-calendar on page (ICS exists in `lib/utils/ics.ts`).
- Manage: duplicate-event handler, delete-event confirmation, CSV download, RSVP open/closed toggle, upgrade placeholder block.

---

# 5. Data Model / Schema Audit

**Existing entities**

- **users**  
  id, email, created_at, updated_at, plan_tier, role, stripe_customer_id, stripe_subscription_id, subscription_status.

- **events**  
  id, slug, title, description, starts_at, location_text, location_url, organizer_email, theme (CHECK light/dark), admin_secret, owner_user_id, created_at, updated_at, capacity_limit, guest_list_visibility, plan_tier, notify_on_rsvp (002), stripe_subscription_item_id, upgraded_at, upgraded_by_user_id (003), custom_rsvp_fields JSONB (004).

- **rsvps**  
  id, event_id, name, contact_info, status (yes/no/maybe), plus_one, created_at.

- **error_logs** (005)  
  id, level, message, context, user_id, event_id, created_at.

- **email_logs** (005)  
  id, to_email, subject, status, error_message, event_id, user_id, created_at.

**Missing for target MVP**
- **events:** `ends_at` (optional), `rsvp_deadline` (optional), `rsvp_open` (boolean, default true), and a way to mark “expired” (e.g. `expires_at` or policy: event date + 7 days). Optional: `cover_image_url` or `cover_theme` for theme selection.
- **Lifecycle:** No table for “event expired” or “attendee data retention”; can be computed from `starts_at`/`created_at` plus app logic, or add `expires_at` on events and optional `anonymized_at` on rsvps.
- **Monetization:** Current schema is user/event plan_tier and Stripe on users. MVP asks for: Keep (€2.99/event), Pro Event (€5.99/event), Organizer Hub (€9.99/mo). Need either new product/sku fields or clear mapping of existing plan_tier + per-event flags to these three.

**Redundant or awkward**
- `types/database.ts` has `Theme` with more values (ocean, forest, etc.) than DB CHECK (light/dark); either extend migration or narrow type.
- `CreateEventInput` in types doesn’t include `capacity_limit`, `ends_at`, `rsvp_deadline`; schema has capacity_limit but create flow doesn’t set it.

**Proposed target schema delta (for next pass)**

1. **events**
   - Add `ends_at TIMESTAMPTZ` (nullable).
   - Add `rsvp_deadline TIMESTAMPTZ` (nullable).
   - Add `rsvp_open BOOLEAN NOT NULL DEFAULT true`.
   - Add `expires_at TIMESTAMPTZ` (nullable) or document policy “event expires 7 days after starts_at”.
   - Optional: `cover_image_url TEXT` or extend `theme` enum if using theme-as-cover.

2. **rsvps**
   - Optional: `anonymized_at TIMESTAMPTZ` for retention (e.g. 30 days after event).

3. **Magic links**
   - Organizer: already “magic” via URL with `admin_secret`; no new table. Ensure `admin_secret` is not guessable (current `generateAdminSecret()` is crypto random).
   - Attendee: MVP says “email confirmation magic link” — currently confirmation email only (no link to edit RSVP). If “magic link” means link to event page + prefill or edit token, add either a signed token in URL or a table (e.g. rsvp_edit_tokens) later; not strictly required for “confirmation” only.

4. **Indexes**
   - Keep existing (slug, admin_secret, owner_user_id, organizer_email, event_id on rsvps). Add index on `events.starts_at` or `events.expires_at` if doing expiry queries.

5. **RSVP status**
   - Already `yes` / `no` / `maybe`; matches “going / maybe / not going”. No change.

---

# 6. Auth, Identity, and Access Audit

**What exists**
- **Supabase Auth** for dashboard users (email/password). Login/signup in `app/login`, `app/signup`. Session via `lib/auth/session.ts`; user row in `users` via `lib/auth/user.ts` and `lib/db/users.ts`.
- **Organizer (no account):** No auth. Access to manage is via secret in path: `/manage/[adminSecret]`. Server loads event by `admin_secret`; anyone with the link can manage. No expiration of link.
- **Attendee:** No account. RSVP is a single POST; confirmation email sent; no “log in to see my RSVP” or magic link to edit (only link to event page in email).

**Fits product wedge?**
- Yes: create without signup, manage via email link, RSVP without account. Optional signup/claim is additive.

**MVP access model**
- **Organizer:** Create → receive email with manage link. Manage = same URL forever (secret). Optionally sign up and claim for dashboard.
- **Attendee:** Submit RSVP with email (required) and optional name; receive confirmation email; no password or account.
- **Secure token handling:** `admin_secret` is 32-char hex from `crypto.randomBytes(16)`. Stored in DB; never in public API response (stripped in GET event by slug). Manage API (PATCH) requires `admin_secret` in body.
- **Expiration:** No expiry on manage link today. MVP may add “event expired” state (read-only after 7 days) without changing auth.

**Reuse vs replace**
- Reuse: Supabase Auth for dashboard; manage-by-secret for anonymous organizers; no attendee auth. No need to add organizer “magic link” login for MVP; the email link to `/manage/{secret}` is the magic link.

---

# 7. Event Creation Flow Audit

**Current flow**
1. User on `/create` fills: title, date, time, location_text, location_url (optional), organizer_email, description (optional), theme (light/dark), notify_on_rsvp (checkbox).
2. Client POSTs to `/api/events` with date + time as separate; API combines to `starts_at` ISO.
3. Validation: `createEventSchema` (Zod) in `lib/validations/event.ts`. DB: `createEvent` in `lib/db/events.ts` generates slug and admin_secret, inserts; does not set `capacity_limit`, `ends_at`, or `rsvp_deadline`.
4. API then calls `sendEventCreatedEmail` (organizer email with public + manage URLs). Failures logged but don’t block response.
5. Response returns `slug`, `adminSecret`, `publicUrl`, `manageUrl`; client redirects to `/created?slug=…&adminSecret=…`.
6. Created page shows public link (copy + preview) and manage link (copy) and “We also emailed this link to you.”

**Gaps vs target MVP**
- **Form:** Add optional end time, optional max capacity, optional RSVP deadline, optional cover image or theme selection (beyond light/dark).
- **API/schema:** Accept and persist `ends_at`, `capacity_limit`, `rsvp_deadline`; optionally `cover_image_url` or extended theme.
- **Created page:** Explicit line “Your private manage link was sent to [email]”; add Share to WhatsApp (wa.me or share URL with pre-filled text).
- **Validation:** Extend `createEventSchema` for new optional fields; keep required: title, date, time, location_text, organizer_email.

**Exact changes for next pass**
- In `app/create/page.tsx`: add optional inputs for end time, capacity, RSVP deadline; optional cover/theme if in scope.
- In `lib/validations/event.ts`: add optional `end_time`, `capacity_limit`, `rsvp_deadline` (and optional cover/theme).
- In `lib/db/events.ts` `createEvent`: map and insert new optional columns.
- In `app/api/events/route.ts`: pass new fields from validated body to `createEvent`.
- In `app/created/page.tsx`: add WhatsApp share; add short line that manage link was sent to organizer email.

---

# 8. Public Event Page Audit

**Current**
- `app/e/[slug]/page.tsx`: Server fetches event by slug; theme (light/dark) drives background/text; title, description, date, time, location (with “View on map” if URL); then `RsvpForm`. Footer “Powered by INVY.” No generateMetadata; no share/add-to-calendar on page; no capacity or “expired” state.

**Gaps**
- **Metadata/OG:** Add `generateMetadata` (or static metadata) with title, description, image (if cover exists), og:url, twitter card.
- **Add-to-calendar:** Expose on page (not only in RSVP success). Reuse `lib/utils/ics.ts` (needs optional `end` if ends_at exists).
- **Share:** Add share button (Web Share API + fallback copy).
- **Capacity:** If `capacity_limit` set, show “X spots left” or “Fully booked”; optionally disable new RSVP when at capacity.
- **Expired:** If event is past and past + 7 days (or `expires_at`), show “This event has ended” and optionally hide or disable RSVP form.
- **Mobile:** Layout is already single column and responsive; ensure tap targets and share/add-to-calendar work well on mobile.

**Exact changes**
- In `app/e/[slug]/page.tsx`: add `generateMetadata` using event title/description/url (and image if present). Add section for add-to-calendar (ICS) and share; show capacity and “spots left” when relevant; add expiry check and read-only/expired message.
- In `lib/utils/ics.ts`: support optional `end: Date` for `ends_at`.

---

# 9. RSVP Flow Audit

**Current**
- `RsvpForm`: name (required), contact_info (required), status (yes/maybe/no), plus_one. POST `/api/rsvps`. Success state: “Thanks for RSVPing,” Add to calendar, Share event. Confirmation email sent when contact_info looks like email (regex); organizer notified if `notify_on_rsvp`. No “edit my RSVP” link; no attendee account.

**MVP requirements**
- RSVP states: going / maybe / not going → already yes / maybe / no.
- Attendee email required, name optional → currently name required, contact_info required (any format). Change to: email required, name optional.
- “Email confirmation magic link” → current behavior is “confirmation email with link to event.” If “magic link” means link to change response, that’s a separate feature (signed token or token table); MVP can keep “confirmation email + event link” only.
- No password, no mandatory account → already the case.

**Exact changes for next pass**
- **Validation:** In `lib/validations/rsvp.ts`, require email format for one field (e.g. `email`), make `name` optional; keep status and plus_one. API can accept `email` + optional `name` and store as contact_info + name.
- **DB:** Either keep `contact_info` as email and allow empty name, or add `email` column and keep `name` optional. Minimal change: keep current columns, allow empty string for name, validate email in contact_info.
- **RsvpForm:** Label contact as “Email” and make name optional; success state: keep add-to-calendar and share; add WhatsApp share if desired.
- **Confirmation email:** Already sends; ensure copy says “You’re on the list” and includes event link; no code change required unless adding “edit your RSVP” link later.

---

# 10. Organizer Dashboard / Management Audit

**Current**
- **Access:** Via `/manage/[adminSecret]` (no login) or `/dashboard/events/[eventId]` (logged-in owner). Dashboard event page uses `canManageEvent(user, event)` and renders same `AdminEventView` with `event.admin_secret`.
- **Capabilities:** View public/manage links, copy; EventStats (total, yes, maybe, no, estimated guests); edit event (title, date, time, location, description, theme, notify_on_rsvp); view RsvpList. No duplicate, delete, CSV, or “RSVP open/closed.”
- **Billing:** Dashboard billing page shows plan and “Coming soon” for upgrades; links to non-existent `/dashboard/billing/upgrade`.

**Gaps**
- **Duplicate event:** New API or server action: clone event (new slug/admin_secret, same details); optional: clear RSVPs. New button in AdminEventView.
- **Delete event:** New API (e.g. DELETE `/api/manage/events/[eventId]` with admin_secret). Confirmation modal or page before delete. Soft delete vs hard: MVP can do hard delete (cascade rsvps) or add `deleted_at` later.
- **CSV export:** Endpoint or client-side: get RSVPs for event, output CSV (name, email/contact, status, +1, date). Button in AdminEventView or RsvpList.
- **Open/close RSVPs:** Add `rsvp_open` to events. PATCH manage API accepts `rsvp_open`; public page checks it and shows “RSVPs closed” and hides or disables form. Toggle in AdminEventView.
- **Upgrade placeholder:** Section or card in manage view: “Upgrade for Keep / Pro Event / Organizer Hub” with prices and CTA (can link to billing or coming-soon).

**Reuse**
- Keep AdminEventView, EventStats, RsvpList, CopyButton, edit form. Add: duplicate (button + handler), delete (button + confirm + API), CSV (button + download), RSVP open/closed toggle, upgrade CTA block.

---

# 11. Email / Notification Audit

**Provider**
- Resend in `lib/emails/resend.ts`; key from `RESEND_API_KEY`. Throws if key missing.

**Where sending happens**
- `app/api/events/route.ts`: after create, `sendEventCreatedEmail(organizerEmail, eventTitle, publicUrl, manageUrl)`.
- `app/api/rsvps/route.ts`: after create RSVP, `sendRsvpConfirmationEmail` (when contact looks like email); `sendOrganizerRsvpEmail` when `event.notify_on_rsvp`.

**Templates**
- All inline HTML + plain text in `lib/emails/resend.ts`: event created, RSVP confirmation, organizer new RSVP. From: `INVY <noreply@invy.rsvp>` (TODO: verify domain).

**Env**
- `RESEND_API_KEY` required. `NEXT_PUBLIC_APP_URL` used for links.

**Readiness**
- **Organizer manage-link email:** Implemented.
- **Attendee RSVP confirmation:** Implemented (when contact is email).
- **Reminder emails (later):** Not implemented; Resend and structure are ready to add templates and a trigger (cron or queue).

---

# 12. Lifecycle / Retention / Background Job Audit

**Current**
- No cron, no Vercel Cron, no background job runner. No `vercel.json` in repo. No cleanup or expiry logic in codebase.

**MVP requirements**
- Free event “live” until 7 days after event date.
- Attendee data deleted (or anonymized) after 30 days unless extended.
- Expired event state (read-only or hidden).
- Cleanup/expiry logic.

**Implementation approach**
- **Event expiry:** Either store `expires_at` (e.g. `starts_at + 7 days`) or compute in app: when rendering public/manage, if “now > event_date + 7 days” treat as expired (show message, optional hide RSVP). No need for background delete of events unless product requires “hide from list” or hard delete.
- **Attendee retention:** Policy: 30 days after event end, anonymize or delete. Options: (1) Cron (e.g. Vercel Cron) that runs daily, finds events with `starts_at + 30 days < now` and updates/ deletes rsvps for those events; (2) add `anonymized_at` on rsvps and set it in same cron; (3) optional “extend retention” flag or paid feature. Schema: add `anonymized_at` or rely on delete; ensure no critical logic depends on keeping PII forever.
- **Pre-expiry reminder:** “Reminder emails” are optional later; no implementation in this pass. When added, cron or queue can select events where `starts_at` is in 24h and send reminder to RSVPs.
- **Ground in existing stack:** Use Vercel Cron (or single serverless function called by cron) that uses same Supabase client and `lib/db` to run queries and updates; no new worker infra.

---

# 13. Billing / Monetization Audit

**Current**
- `lib/stripe/client.ts`: no Stripe package; placeholder `createCheckoutSession` and `createPortalSession` throw. `STRIPE_CONFIG` with env price IDs (Pro/Business monthly/yearly).
- `types/database.ts`: `PRICING` pro/business monthly/yearly (9/90, 29/290). User has plan_tier, stripe_customer_id, subscription_status; event has stripe_subscription_item_id, upgraded_at, upgraded_by_user_id.
- `app/dashboard/billing/page.tsx`: shows current plan, Pro/Business cards, “Coming soon” buttons; links to `/dashboard/billing/upgrade` (404).

**MVP ask**
- Scaffolding for: **Keep** (€2.99/event), **Pro Event** (€5.99/event), **Organizer Hub** (€9.99/mo). Current schema is monthly Pro/Business only; no one-off per-event products.

**Recommendation**
- **Scaffold now:** (1) Data model: either add product type/sku (e.g. `event_products` or columns) so events can be “Keep” or “Pro Event” and users can have “Organizer Hub” subscription; or document mapping (e.g. plan_tier “pro” = Hub, and event-level “Keep”/“Pro Event” as one-off). (2) Billing page: replace or extend with three blocks (Keep, Pro Event, Hub) with prices and “Coming soon” or placeholder CTA. (3) Optional: Stripe product/price IDs in env (e.g. `STRIPE_KEEP_PRICE_ID`, `STRIPE_PRO_EVENT_PRICE_ID`, `STRIPE_HUB_PRICE_ID`).
- **Defer:** Actual Stripe Checkout, webhooks, and updating user/event records on payment. Ensure free core flow (create, RSVP, manage) never depends on billing.

---

# 14. Analytics / Tracking Audit

**Current**
- No analytics provider or tracking library in the repo. No event-level analytics (views, RSVP funnel).

**Minimal plan for next pass**
- Add a simple analytics layer (e.g. Vercel Analytics, Plausible, or PostHog) at app level. Events to consider: `event_created`, `rsvp_submitted`, `manage_link_opened`, `event_page_view` (by slug). No need for deep funnel in MVP; enough to know “creates” and “RSVPs” and optionally “manage page views.” Hook: in `app/api/events` (create), `app/api/rsvps` (create), and optionally in `app/e/[slug]/page` (view) and `app/manage/[adminSecret]/page` (manage view). Reuse: none (net-new).

---

# 15. Biggest Reusable Assets

1. **Event creation API + email** — `app/api/events/route.ts` + `sendEventCreatedEmail`. Handles validate, create, email, return URLs. Extend with new fields and created-page copy.
2. **Manage-by-secret flow** — `app/manage/[adminSecret]/page.tsx` + `getEventByAdminSecret`. Full manage experience; add duplicate, delete, CSV, rsvp_open, upgrade placeholder.
3. **RSVP API + emails** — `app/api/rsvps/route.ts` + confirmation + organizer notification. Adjust validation for email-required/name-optional.
4. **AdminEventView** — `components/AdminEventView.tsx`. Stats, edit form, RSVP list, copy links. Add actions and upgrade block.
5. **RsvpForm** — `components/RsvpForm.tsx`. Status, +1, success state with add-to-calendar and share. Make name optional, email required; add WhatsApp.
6. **DB layer** — `lib/db/events.ts`, `lib/db/rsvps.ts`. createEvent, getEventBySlug, getEventByAdminSecret, updateEvent, createRsvp, getRsvpsForEvent, getRsvpStatsForEvent. Extend create/update for new fields; add delete/duplicate helpers if needed.
7. **Validations** — `lib/validations/event.ts`, `lib/validations/rsvp.ts`. Zod schemas; extend for new fields and email/name rules.
8. **ICS utility** — `lib/utils/ics.ts`. Add-to-calendar; add optional end date.
9. **Resend + logging** — `lib/emails/resend.ts`, `lib/logging/emails.ts`. All transactional emails and logging; ready for reminders later.
10. **Supabase + types** — `lib/supabase/server.ts`, `types/database.ts`. Single source of truth for Event/RSVP/User types; add new columns and types in one place.

---

# 16. Biggest Problems / Risks

1. **Billing page 404:** `/dashboard/billing/upgrade` is linked but doesn’t exist. Either add route or remove/change link.
2. **Schema/type drift:** Theme in types has more values than DB CHECK; CreateEventInput and createEvent omit capacity_limit, ends_at, rsvp_deadline. Align schema, migrations, types, and API in one pass.
3. **No event/RSVP lifecycle:** Expiry and retention not implemented. Without cron + policy, events and PII live forever; legal/product risk. Add at least policy + optional cron in next pass.
4. **Public event page has no OG/metadata:** Shares show generic app title. Add generateMetadata for `/e/[slug]` with event title/description.
5. **RSVP name required vs MVP:** MVP says name optional, email required. Current form and schema require name; validation and UI need update.
6. **Manage view missing key actions:** Duplicate, delete, CSV, open/close RSVP, upgrade placeholder. Organizers will expect at least duplicate and delete.
7. **Landing page too thin:** No FAQ, trust, or “how it works” can hurt conversion and trust; quick to extend with sections.
8. **Created page doesn’t emphasize “link sent by email”:** Minor UX; add one clear sentence so users don’t think they must save the manage link only from the page.
9. **No rate limiting on API:** Create and RSVP are open POSTs; abuse possible. Add simple rate limit (e.g. by IP or key) in a later pass.
10. **Dashboard nav incomplete:** Claim, Billing, Settings only via URL. Add links so signed-in users can find them.

---

# 17. Recommended Implementation Plan Mapped to Existing Files

## Phase 1: Critical MVP core

**1.1 Schema and types**
- **Files:** `supabase/migrations/` (new migration), `types/database.ts`, `lib/validations/event.ts`, `lib/db/events.ts`.
- **Changes:** Migration: add `ends_at`, `rsvp_deadline`, `rsvp_open` (default true), optionally `expires_at` or document “expires 7 days after starts_at”. Types: add these to Event and CreateEventInput/UpdateEventInput. createEventSchema: optional end_time, capacity_limit, rsvp_deadline. createEvent: insert new fields; updateEvent: support new fields + rsvp_open.
- **Order:** Migration first, then types, then validations, then db.

**1.2 Event creation form and API**
- **Files:** `app/create/page.tsx`, `app/api/events/route.ts`, `lib/db/events.ts`.
- **Changes:** Create page: add optional end time, capacity, RSVP deadline (and optional cover/theme if scoped). API: parse and pass to createEvent. createEvent: persist new columns.
- **Dependencies:** 1.1 done.

**1.3 Created success page**
- **Files:** `app/created/page.tsx`.
- **Changes:** Add “Your private manage link was sent to [email].” Add WhatsApp share button (e.g. `https://wa.me/?text=...` with public URL).
- **Dependencies:** None.

**1.4 Public event page: metadata, share, calendar, capacity, expiry**
- **Files:** `app/e/[slug]/page.tsx`, `lib/utils/ics.ts`.
- **Changes:** generateMetadata(slug) with event title, description, og:url, optional image. Add add-to-calendar (ICS with optional end) and share button on page. If capacity_limit set, compute spots left and show; optionally disable RSVP when full. If event expired (e.g. starts_at + 7 days < now), show “Event ended” and hide/disable RSVP.
- **Dependencies:** 1.1 for ends_at/expiry.

**1.5 RSVP: email required, name optional**
- **Files:** `lib/validations/rsvp.ts`, `components/RsvpForm.tsx`, optionally `app/api/rsvps/route.ts`.
- **Changes:** Schema: email required, name optional. Form: label email, make name optional. API: validate email; allow empty name (store as empty string or null if column nullable). Success: add WhatsApp share if desired.
- **Dependencies:** None.

## Phase 2: Supporting MVP logic

**2.1 Manage: duplicate, delete, CSV, RSVP open/closed**
- **Files:** `lib/db/events.ts`, `app/api/manage/events/[eventId]/route.ts` (or new routes), `components/AdminEventView.tsx`, `lib/validations/event.ts`.
- **Changes:** Duplicate: new API (e.g. POST `/api/manage/events/[eventId]/duplicate` with admin_secret) that creates new event with new slug/secret, same data, no RSVPs. Delete: DELETE `/api/manage/events/[eventId]` with admin_secret; cascade or soft delete. CSV: GET `/api/manage/events/[eventId]/rsvps.csv` with admin_secret returning CSV, or client-side from existing list. rsvp_open: PATCH manage accepts rsvp_open; public page checks it. AdminEventView: buttons and toggle for all of the above.
- **Dependencies:** 1.1 for rsvp_open.

**2.2 Manage: upgrade placeholder**
- **Files:** `components/AdminEventView.tsx` (or new component).
- **Changes:** Add section/card: “Upgrade — Keep (€2.99/event), Pro Event (€5.99/event), Organizer Hub (€9.99/mo)” with placeholder CTA.
- **Dependencies:** None.

**2.3 Billing page and routes**
- **Files:** `app/dashboard/billing/page.tsx`, optionally `app/dashboard/billing/upgrade/page.tsx`.
- **Changes:** Align copy with Keep / Pro Event / Organizer Hub; remove or fix link to `/dashboard/billing/upgrade` (either create route or use # or “Coming soon” modal).
- **Dependencies:** None.

**2.4 Lifecycle: expiry and retention**
- **Files:** New: e.g. `app/api/cron/expire` or `lib/jobs/expire.ts`; Vercel Cron in `vercel.json`. Optional: migration for `anonymized_at` on rsvps.
- **Changes:** Document “event expires 7 days after starts_at” and enforce in UI (already in 1.4). Optional cron: daily job that sets anonymized_at or deletes rsvps for events with starts_at + 30 days < now. Add vercel.json with cron if using Vercel.
- **Dependencies:** 1.1 if using expires_at column.

## Phase 3: Polish and scaffolding

**3.1 Landing: how it works, benefits, FAQ, trust**
- **Files:** `app/page.tsx` (or new sections/components).
- **Changes:** Add sections: short “how it works” (e.g. 3 steps), key benefits, FAQ accordion, trust/privacy line.
- **Dependencies:** None.

**3.2 Dashboard nav**
- **Files:** `components/DashboardNav.tsx`.
- **Changes:** Add links to Claim, Billing, Settings if desired.
- **Dependencies:** None.

**3.3 Monetization data model**
- **Files:** `types/database.ts`, optional migration.
- **Changes:** Document or add product/sku for Keep, Pro Event, Hub; optional env for Stripe price IDs. No payment flow yet.
- **Dependencies:** None.

**3.4 Analytics hooks**
- **Files:** Layout or API routes where events occur.
- **Changes:** Integrate one analytics provider; fire event_created, rsvp_submitted, etc. Optional.
- **Dependencies:** None.

---

# 18. Exact Questions / Information Needed For Next Build Pass

**A. Files to inspect first**
- `supabase/migrations/001_initial_schema.sql` (and 002–005) for current columns and constraints.
- `types/database.ts` for Event, CreateEventInput, UpdateEventInput, RSVP.
- `lib/db/events.ts` (createEvent, updateEvent, getEventBySlug, getEventByAdminSecret).
- `lib/validations/event.ts` and `lib/validations/rsvp.ts`.
- `app/api/events/route.ts`, `app/api/rsvps/route.ts`, `app/api/manage/events/[eventId]/route.ts`.
- `app/create/page.tsx`, `app/created/page.tsx`, `app/e/[slug]/page.tsx`, `components/AdminEventView.tsx`, `components/RsvpForm.tsx`.
- `lib/emails/resend.ts` and `lib/utils/ics.ts`.

**B. Files to modify first**
- New migration in `supabase/migrations/` (events: ends_at, rsvp_deadline, rsvp_open; optional expires_at, rsvps anonymized_at).
- `types/database.ts` (Event, CreateEventInput, UpdateEventInput).
- `lib/validations/event.ts` and `lib/validations/rsvp.ts`.
- `lib/db/events.ts` (createEvent, updateEvent; optional deleteEvent, duplicateEvent).
- `app/api/events/route.ts` (accept new fields).
- `app/create/page.tsx` (new optional fields).

**C. Files likely to create**
- `supabase/migrations/006_*.sql` (lifecycle + manage fields).
- `app/api/manage/events/[eventId]/duplicate/route.ts` or similar.
- `app/api/manage/events/[eventId]/route.ts` (add DELETE).
- `app/api/manage/events/[eventId]/rsvps/route.ts` or `rsvps.csv` for CSV export.
- Optional: `app/api/cron/expire/route.ts` and `vercel.json` for cron.
- Optional: `app/dashboard/billing/upgrade/page.tsx` or remove link.

**D. Schema changes required**
- events: `ends_at TIMESTAMPTZ`, `rsvp_deadline TIMESTAMPTZ`, `rsvp_open BOOLEAN NOT NULL DEFAULT true`; optional `expires_at`.
- rsvps: optional `anonymized_at TIMESTAMPTZ` for retention.
- Ensure capacity_limit is used in create/update if not already.

**E. Existing services/utilities to reuse**
- `lib/db/events.ts` (createEvent, updateEvent, getEventBySlug, getEventByAdminSecret, getEventById).
- `lib/db/rsvps.ts` (createRsvp, getRsvpsForEvent, getRsvpStatsForEvent).
- `lib/emails/resend.ts` (all three sends).
- `lib/utils/ics.ts` (extend with end date).
- `lib/utils/secrets.ts` (generateAdminSecret), `lib/utils/slug.ts` (generateSlug).
- `lib/permissions/capabilities.ts` (canManageEvent for dashboard).

**F. Existing code to avoid or replace**
- Do not rely on `/dashboard/billing/upgrade` until route exists or link is changed.
- Do not require name on RSVP (change to optional).
- Do not expose admin_secret in any public or client-visible response (already stripped in GET event by slug).

**G. Environment variables already present**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`; optional `SUPER_ADMIN_EMAIL`.

**H. Environment variables missing but needed**
- For cron (if used): Vercel Cron uses `CRON_SECRET` or similar for auth; document in README.
- For Stripe (when implemented): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, optional price IDs for Keep/Pro Event/Hub.
- None strictly required for Phase 1–2 MVP.

**I. Architectural decisions already made**
- Manage-by-secret URL; no organizer auth required.
- Supabase Auth only for dashboard/claim.
- Resend for all transactional email.
- Single Next.js app on Vercel; no separate worker (cron can be serverless route).
- Event and RSVP data in same DB; no separate microservices.

**J. Key open decisions**
- Soft delete (deleted_at) vs hard delete for events.
- Whether to add “edit my RSVP” magic link (signed token or table) in MVP or later.
- Exact Stripe product mapping for Keep / Pro Event / Organizer Hub (one-off vs subscription).
- Whether to store `expires_at` on events or compute from starts_at + 7 days everywhere.

---

# 19. Final Recommendation

- **Evolve the current codebase.** Do not rewrite. The core (create → event page → RSVP → manage by link, plus optional dashboard/claim) is in place and matches the product thesis.

- **Cleanest path to MVP:**  
  (1) Schema + types + validation + create form/API (new fields and created page copy + WhatsApp).  
  (2) Public event page: metadata, share, add-to-calendar, capacity, expiry.  
  (3) RSVP: email required, name optional.  
  (4) Manage: duplicate, delete, CSV, rsvp_open, upgrade placeholder.  
  (5) Billing page fix and tier scaffolding.  
  (6) Lifecycle: document expiry; optional cron for retention.  
  (7) Landing and nav polish.

- **Do first:** Schema migration and type/validation alignment; creation form and created page; public page metadata and share/calendar/capacity/expiry; RSVP email/name; manage duplicate/delete/CSV/rsvp_open and upgrade placeholder.

- **Definitely wait:** Full Stripe integration, reminder emails, custom slug, organizer hub product depth, advanced analytics, and any “edit RSVP” magic link until core MVP is shipped and validated.
