# Plan: Add Signup Flow Before Stripe Checkout

## Goal

Replace the current CTA → Stripe Checkout flow with a multi-step signup form that collects user data outlined in `docs/SPEC-onboarding.md` **before** redirecting to Stripe. This enables the "magic moment" — a personalized first interaction based on data collected during signup.

## Current Flow

```
CTA (Navbar/Hero/FinalCTA/Pricing) → #pricing section
  → "Get Started" button → POST /api/checkout → Stripe hosted checkout
  → Stripe webhook creates user row (email from Stripe, no name/preferences)
  → /setup (provisioning) → /dashboard
```

**Problem:** We only get the user's email (from Stripe), so the first bot interaction is generic. No name, no preferences, no context.

## Proposed Flow

```
CTA → /signup?tier=standard&persona=personal-assistant
  → Step 1: Name + Email
  → Step 2: Role / Industry (optional)
  → Step 3: What do you need help with? (multi-select)
  → Step 4: Communication style + Top priorities
  → Submit → POST /api/checkout (with signup data) → Stripe checkout
  → Stripe webhook creates user row WITH all signup data
  → /setup → /dashboard (bot delivers personalized "magic moment")
```

## Data Collected

| Field | Step | Required | Storage Column |
|-------|------|----------|----------------|
| Name | 1 | Yes | `users.preferred_name` |
| Email | 1 | Yes | `users.email` |
| Role / Industry | 2 | No | `users.role` |
| What they need help with | 3 | Yes | `users.help_topics` (jsonb array) |
| Communication style | 4 | Yes | `users.communication_style` |
| Top priorities | 4 | Yes | `users.top_priorities` (jsonb array) |

## Implementation Steps

### 1. Create the `/signup` page (`app/signup/page.tsx`)

A multi-step form with 4 steps, using client-side state (no API calls until final submit). The page reads `tier` and `persona` from query params (passed from the pricing CTA).

**Step 1 — Basics:**
- Name (text input, required)
- Email (email input, required)

**Step 2 — About You:**
- Role / Industry (text input, optional, with placeholder suggestions like "Marketing", "Engineering", "Founder")
- "Skip" option

**Step 3 — Help Topics:**
- Multi-select cards: Email, Calendar, Tasks, Research, Notes (maps to the auto-setup actions from the spec)
- At least one required

**Step 4 — Preferences:**
- Communication style: radio buttons — "Brief & direct", "Detailed", "Casual"
- Top priority: single select — "Productivity", "Email", "Calendar", "Research", "All of the above"

**UI Design:**
- Progress bar at top (Step X of 4)
- Back/Next navigation
- Same brand styling as rest of site (navy/brand colors, rounded inputs, Plus Jakarta Sans font)
- Mobile responsive

### 2. Update CTA links across landing page

Change all CTAs that currently point to `#pricing` or call `handleCheckout()` to instead navigate to `/signup` with query params.

**Files to update:**
- `components/Navbar.tsx` — Desktop + mobile CTAs
- `components/Hero.tsx` — Hero CTA
- `components/FinalCTA.tsx` — Bottom CTA
- `components/Pricing.tsx` — "Get Started" buttons (pass `tier` and `persona` as query params)

**Pricing.tsx specifically:** The "Get Started" button changes from calling `handleCheckout()` to navigating to `/signup?tier={tierId}&persona={selectedPersona}`.

The Navbar/Hero/FinalCTA links will default to `/signup?tier=standard&persona=personal-assistant` (the default/only non-sold-out tier).

### 3. Update `/api/checkout` route to accept signup data

Modify `app/api/checkout/route.ts` to:
- Accept additional fields: `name`, `email`, `role`, `helpTopics`, `communicationStyle`, `topPriorities`
- Pass all fields through Stripe session `metadata` (Stripe metadata values must be strings, so arrays will be JSON-stringified)
- Pre-fill `customer_email` on the Stripe session with the email from our form (so Stripe doesn't ask again)

### 4. Update Stripe webhook to persist signup data

Modify `app/api/webhooks/stripe/route.ts` to:
- Read the new metadata fields from the completed checkout session
- Parse JSON-stringified arrays back into proper values
- Store all fields when inserting the `users` row

### 5. Add database columns

Create a Supabase migration to add new columns to the `users` table:

```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS help_topics jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS communication_style text,
  ADD COLUMN IF NOT EXISTS top_priorities jsonb DEFAULT '[]';
```

### 6. Update TypeScript types

If there's a shared User type or interface, add the new fields. Update any type definitions that reference the users table shape.

## Files Changed (Summary)

| File | Change |
|------|--------|
| `app/signup/page.tsx` | **NEW** — Multi-step signup form |
| `components/Navbar.tsx` | Update CTA hrefs |
| `components/Hero.tsx` | Update CTA href |
| `components/FinalCTA.tsx` | Update CTA href |
| `components/Pricing.tsx` | Replace `handleCheckout()` with navigation to `/signup` |
| `app/api/checkout/route.ts` | Accept + pass through signup data |
| `app/api/webhooks/stripe/route.ts` | Persist new fields to `users` table |
| `supabase/migrations/XXXX_add_signup_fields.sql` | **NEW** — Add columns |

## Out of Scope

- Post-signup onboarding scripts / 7-day drip sequence (spec items #5, #6)
- Embedded web chat (spec item #1)
- Subscription/trial gating (spec item #3)
- Progressive Telegram invite (spec item #4)
- Skills marketplace (spec item #7)
- Auto-setup actions (e.g., configuring email digest based on help topics) — that's a backend/bot concern for a separate PR

## Edge Cases to Handle

- **User navigates to `/signup` with no query params:** Default to `tier=standard`, `persona=personal-assistant`
- **Concierge tier (sold out):** The Pricing component already prevents clicking; no change needed
- **User goes back from Stripe:** `cancel_url` remains `/#pricing`; signup data is lost (acceptable for v1 — not persisted until payment completes)
- **Stripe metadata size limit:** Stripe allows up to 500 chars per metadata value and 50 keys total — our data fits well within this
