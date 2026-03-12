# ClawsRus Launch Punch-List

Generated: 2026-03-12
Status: Live but tightening required

---

## 🔴 FIX NOW (Trust/Funnel Risks)

These erode conversion or create immediate refund/support burden.

### 1. Pricing Truth Audit
**Problem:** Inconsistent pricing across homepage, schema JSON, and product reality.
- Homepage FAQ: Pro = $29/mo
- Homepage schema: Pro = $79
- Current model: Setup package + free/pro membership

**Fix:**
- [ ] Single source of truth in `lib/constants.ts` or `lib/plans.ts`
- [ ] Audit and fix:
  - `app/page.tsx` schema JSON
  - `components/Pricing.tsx`
  - `components/FAQ.tsx`
  - `README.md`
  - Any hardcoded references in checkout/webhook

**Owner:** Yaya / Gizmo
**Time:** 30 min

---

### 2. Persona Availability Truth
**Problem:** Homepage shows 3 personas, reality may differ.
- Personal Assistant (live?)
- Chief of Staff (Coming Soon)
- Sales Expert ( Coming Soon?)

**Fix:**
- [ ] Define actual availability:
  - What personas work today?
  - What is truly "Coming Soon" vs internal only?
- [ ] Update `components/Personas.tsx`
- [ ] Update persona selection in signup/checkout
- [ ] Add guardrails (disable unavailable, clear messaging)

**Owner:** Yaya
**Time:** 1 hour

---

### 3. Signup Page SSR/Pregeneration
**Problem:** `/signup` returns "Loading..." to non-JS fetchers.
- Breaks link previews
- May affect some ad platform crawlers
- Looks broken in simple fetch tools

**Fix:**
- [ ] Add server-side rendering fallback
- [ ] Or static placeholder with proper meta
- [ ] Ensure OpenGraph tags present for sharing

**Owner:** Gizmo
**Time:** 1-2 hours

---

## 🟡 FIX THIS WEEK (Operational Risks)

These won't kill you today but will create pain at scale.

### 4. End-to-End Funnel Test
**Problem:** Haven't verified real user path recently.

**Fix:**
- [ ] Walk through as real user:
  - www.clawsrus.com → signup
  - Fill 4-step form
  - Stripe checkout (use test mode)
  - Success → setup
  - Setup polling → dashboard
  - First dashboard load
  - First chat interaction
- [ ] Document any friction points
- [ ] Fix obvious breaks

**Owner:** Yaya + Gizmo
**Time:** 1 hour

---

### 5. Webhook Observability
**Problem:** Stripe webhook does a lot with minimal logging/visibility.
- User creation
- Trial creation
- Skill purchases
- Subscription sync
- Channel seeding

**Fix:**
- [ ] Add structured logging to webhook handler
- [ ] Log: event type, user ID, success/failure, error details
- [ ] Consider webhook monitoring (Stripe dashboard + alerts)
- [ ] Document how to check if a user creation succeeded

**Owner:** Gizmo
**Time:** 2-3 hours

---

### 6. Setup Flow Hardening
**Problem:** Polling-based setup is acceptable but brittle.
- 4s polling may feel slow
- No clear "stuck" recovery path
- Auth bootstrap is a second hop

**Fix:**
- [ ] Add progress indicators beyond spinner
- [ ] Add timeout handling with clear retry guidance
- [ ] Ensure setup token cleanup (expiry, invalidation)
- [ ] Add operator view: list pending setups, status

**Owner:** Gizmo
**Time:** 2-4 hours

---

### 7. Free vs Pro vs Setup Package Clarity
**Problem:** Users may not understand the model.
- Setup package = one-time
- Trial = 7 days Pro
- Then Free or Pro monthly

**Fix:**
- [ ] Audit messaging at each touchpoint:
  - Homepage
  - Pricing
  - Signup
  - Checkout
  - Setup
  - Dashboard (trial banner)
- [ ] Ensure consistent language
- [ ] Add FAQ entries for confusion points

**Owner:** Yaya
**Time:** 1-2 hours

---

## 🟢 WATCH BUT DON'T TOUCH YET (Future Risks)

These are known limitations, not immediate fires.

### 8. Skills Marketplace Maturity
**Observation:** Skills system exists but inventory is light.
- Free skills: ~17 entries in library
- Paid skills: 2 stubs

**Action:**
- [ ] Monitor install/uninstall success rates
- [ ] Collect feedback on which skills users actually want
- [ ] Build next 3-5 paid skills based on demand

**Timeline:** Post-launch learning

---

### 9. Dashboard V1 vs V2 Transition
**Observation:** Code shows `DashboardShellV2` feature flag.
- V1: Legacy shell with panels
- V2: Newer shell (incomplete?)

**Action:**
- [ ] Decide: ship V1 fully, or cut over to V2
- [ ] Don't maintain both long-term
- [ ] Remove dead code once decision made

**Timeline:** After initial launch stability

---

### 10. Stale Documentation
**Observation:** README and some docs reflect old business model.

**Action:**
- [ ] Update README.md to current reality
- [ ] Archive or update TECH-SETUP.md
- [ ] Ensure AGENTS.md reflects actual personas

**Timeline:** This week (low urgency, high clarity value)

---

## 📊 Success Metrics to Watch

Starting now, track weekly:

| Metric | Target | Current |
|--------|--------|---------|
| Homepage → Signup CTR | >10% | ? |
| Signup → Checkout Start | >60% | ? |
| Checkout → Payment Success | >80% | ? |
| Payment → Setup Complete | >90% | ? |
| Setup → Dashboard Active | >95% | ? |
| Trial → Pro Conversion | >15% | ? |
| Support tickets / signup | <5% | ? |

**Owner:** Yaya to set up tracking

---

## 🎯 Immediate Next Actions (Today)

1. **Yaya:** Confirm pricing truth (what should Pro membership actually cost?)
2. **Yaya:** Confirm persona availability (what's actually live?)
3. **Gizmo:** Fix pricing inconsistencies on site
4. **Gizmo:** Run end-to-end funnel test
5. **Both:** Review this list, assign owners, set deadlines

---

*Last updated: 2026-03-12*
