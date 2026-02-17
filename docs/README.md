# ClawsRus Product Documentation

**Last Updated:** 2026-02-17

---

## Overview

This directory contains all product specs, feature roadmaps, and design decisions for ClawsRus.

---

## Product Specs

| Spec | Status | Description |
|------|--------|-------------|
| [SPEC-onboarding.md](./SPEC-onboarding.md) | 🟡 Draft | Onboarding flow, data collection, 7-day sequence, personas |
| [SPEC-tiers-pricing.md](./SPEC-tiers-pricing.md) | 🟡 Draft | Tier structure (Standard/Pro/Enterprise), pricing model |
| [SPEC-referral.md](./SPEC-referral.md) | 🔴 Planned | Referral program mechanics |
| [SPEC-enterprise.md](./SPEC-enterprise.md) | 🔴 Planned | Multi-agent, concierge setup, custom integrations |

**Legend:**
- 🔴 Planned (not started)
- 🟡 Draft (in progress)
- 🟢 Approved (ready to build)
- ✅ Shipped

---

## Current Tier Structure

| Tier | Price | Key Features |
|------|-------|--------------|
| **Standard** | Free | 1 persona, pay-per-skill, basic features |
| **Pro** | $X/mo | 1 persona, all skills free, advanced analytics |
| **Enterprise** | Custom | Multi-agent, concierge setup, dedicated support |

See [SPEC-tiers-pricing.md](./SPEC-tiers-pricing.md) for full details.

---

## Key Design Decisions

### 1. Persona Model
- Standard + Pro: Locked to 1 persona (Personal Assistant)
- Skills = customization/uplevel path
- Multi-agent = Enterprise tier only

**Rationale:** Simplifies product, creates clear upgrade path.

### 2. Trial Mechanics
- 7-day Pro trial with full access
- After trial: Soft downgrade to Standard (not lockout)
- No trial extension needed (users keep basic access)

**Rationale:** Builds trust, reduces pressure, encourages organic upgrades.

### 3. Skills Pricing
- All skills first-party (100% margin)
- Standard users: Pay $9-99 per skill
- Pro/Enterprise: All skills free

**Rationale:** Skills are upsell for Standard, value-add for Pro.

### 4. Telegram Optional
- Signup → Web chat (no app required)
- Telegram offered after user gets value
- Progressive enhancement, not requirement

**Rationale:** Reduces onboarding friction (from Katie feedback).

---

## Roadmap Phases

### Phase 1: Foundation (Weeks 1-3)
- [x] Product specs
- [ ] Embedded web chat
- [ ] User dashboard (basic)
- [ ] Subscription + trial gating

### Phase 2: Activation (Weeks 4-6)
- [ ] Persona onboarding scripts
- [ ] 7-day drip sequence
- [ ] Skills marketplace (v1)

### Phase 3: Growth (Weeks 7+)
- [ ] Referral program
- [ ] Progressive Telegram invite
- [ ] Analytics dashboard
- [ ] Enterprise tier (multi-agent)

---

## Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| **Conversion** | Signup → 3+ messages sent | 60%+ |
| **Activation** | Users who complete 7-day sequence | 40%+ |
| **Trial → Paid** | Pro trial → paid conversion | 20%+ |
| **Retention (30d)** | Users active after 30 days | 50%+ |
| **Skill purchases** | Standard users buying skills | 10%+ |

---

## Open Questions

1. **Pro pricing:** $20/mo? $30/mo? Needs research.
2. **Persona auto-updates:** How do we handle breaking changes?
3. **Enterprise sales process:** Self-serve demo or sales-led?
4. **Referral incentive:** 1 month free? 2 months?
5. **Data portability:** Export format (JSON? CSV?)?

---

## Resources

- [Business Plan](../BUSINESS-PLAN.md)
- [Competitor Research](../COMPETITOR-RESEARCH.md)
- [GTM Plan](../GTM-PLAN.md)
- [Landing Page Copy](../LANDING-PAGE-COPY.md)

---

## Change Log

| Date | Change |
|------|--------|
| 2026-02-17 | Created docs structure, added onboarding + tiers specs |
