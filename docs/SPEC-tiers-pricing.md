# Tier & Pricing Structure

**Version:** 1.0  
**Date:** 2026-02-17  
**Status:** Draft

---

## Overview

Three-tier model:
- **Standard (Free)** — Self-serve, limited features, pay-per-skill
- **Pro (Subscription)** — Premium features, free skills, advanced analytics
- **Enterprise (Custom)** — Multi-agent, concierge setup, white-glove support

---

## Feature Matrix

| Feature | Standard (Free) | Pro ($X/mo) | Enterprise (Custom) |
|---------|-----------------|-------------|---------------------|
| **Access** |
| Web chat | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ |
| Telegram/channels | ✅ | ✅ | ✅ |
| **Persona** |
| Personal Assistant | ✅ (1 persona) | ✅ (1 persona) | ✅ Multi-agent |
| Custom personas | ❌ | ❌ | ✅ |
| Multi-agent setup | ❌ | ❌ | ✅ |
| **Skills** |
| Skill access | Pay per ($9-99) | Free (all skills) | Free + custom |
| Skill marketplace | Browse + purchase | Browse + activate | Custom integrations |
| **Analytics** |
| Basic usage stats | ✅ | ✅ | ✅ |
| Advanced analytics | ❌ | ✅ | ✅ |
| Custom dashboards | ❌ | ❌ | ✅ |
| **Support** |
| Documentation | ✅ | ✅ | ✅ |
| Email support | Self-serve | Priority | Dedicated |
| Onboarding | DIY | DIY | Concierge setup |
| **Limits** |
| Message volume | Basic | Higher | Unlimited |
| API access | ❌ | ✅ | ✅ |
| Team/multi-user | ❌ | ❌ | ✅ |

---

## Pricing (TBD)

| Tier | Price | Trial |
|------|-------|-------|
| Standard | Free | N/A |
| Pro | $X/month or $Y/year | 7 days |
| Enterprise | Custom | 14 days + demo |

**Notes:**
- Pro pricing needs benchmarking (competitors, willingness-to-pay)
- Annual discount (e.g., 2 months free)
- Enterprise starts around $X00-$X,000/mo depending on scale

---

## Revenue Model

### Primary: Subscriptions
- Pro tier = recurring revenue
- Enterprise tier = high-ticket, white-glove

### Secondary: Skills (Standard users only)
- Skills priced $9-99 each
- 100% margin (all first-party)
- Pro/Enterprise get free (incentive to upgrade)

### Tertiary: Referral/Growth
- Referral program gives free months
- Viral loop for user acquisition

---

## Tier Positioning

| Tier | Target User | Value Prop |
|------|-------------|------------|
| **Standard** | Tire-kickers, casual users | "Try before you buy" — limited but functional |
| **Pro** | Power users, professionals | "Unlock everything" — all skills, better support, analytics |
| **Enterprise** | Teams, executives, agencies | "White glove + multi-agent" — custom setup, dedicated support |

---

## Key Design Decisions

1. **Standard is not a trap** — Users keep basic features after trial expires (no hard paywall). This builds trust.

2. **Persona lock** — Everyone gets 1 persona (Personal Assistant to start). Multi-agent is Enterprise-only. This simplifies product + creates clear upsell path.

3. **Skills as differentiation** — Free users can still uplevel via skills (pay-per). Pro users get all skills free. This creates value prop for both tiers.

4. **Enterprise = bespoke** — Not a self-serve product. Sales-led, custom pricing, onboarding support. Different motion entirely.

---

## Trial Mechanics

### Pro Trial (7 days)
- Starts on signup
- Full Pro access during trial
- Day 8: Prompt to upgrade
- Day 10: Downgrade to Standard (soft landing, not lockout)

### Enterprise Trial (14 days + demo)
- Sales-assisted
- Custom setup during trial
- Post-trial: custom contract

---

## Open Questions

1. **Pro pricing:** $20/mo? $30/mo? Need competitor analysis + willingness-to-pay research.
2. **Annual discount:** 2 months free (16%)? More aggressive?
3. **Enterprise starting price:** $500/mo? $1,000/mo?
4. **Skill pricing tiers:** All skills $9-99, or should some be premium ($49-99)?
5. **Team pricing (Pro):** Do we offer Pro for teams, or is that always Enterprise?

---

## Next Steps

- [ ] Competitor pricing research
- [ ] Customer willingness-to-pay interviews
- [ ] Finalize Pro monthly price
- [ ] Design Enterprise sales process
- [ ] Build referral program mechanics
