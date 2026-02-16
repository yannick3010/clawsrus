# ClawsRUs — Business Plan

## The Vision

**Mission:** Make AI assistants accessible to everyone — not as a technical tool, but as a ready-to-use team member.

We don't sell infrastructure. We sell **outcomes**.

> Competitors: "Deploy OpenClaw in 1 minute"  
> ClawsRUs: "Here's your Sales Expert AI"

---

## The Problem

- OpenClaw is powerful but requires technical setup
- Competitors solve deployment, not usage
- Non-technical users get "installed" AI but have no idea how to use it
- Generic AI assistants don't know your business, role, or preferences

---

## The Solution

**Persona-based AI Assistants**

Instead of installing a generic AI, users choose a pre-configured persona:

| Persona | Who It's For | What It Does |
|---------|--------------|--------------|
| 🤵 Chief of Staff | Executives, Founders | Strategic thinking, scheduling, email management, research |
| 📢 Sales Expert | Sales reps, founders | Pipeline management, follow-ups, outreach drafting, lead research |
| 🏋️ Fitness Buddy | Health-conscious individuals | Workout plans, nutrition, motivation, progress tracking |
| 📚 Research Assistant | Analysts, students | Summaries, competitive intel, article synthesis |
| 🏠 Personal Assistant | Everyone | Life admin, bookings, reminders, travel planning |

**Each persona includes:**
- Pre-configured SOUL.md (personality)
- Pre-configured USER.md (user context)
- Core skills pre-installed
- Pre-built prompt templates
- Memory structure optimized for their role

---

## Revenue Model

### Membership Tiers

| Tier | Price | What's Included |
|------|-------|-----------------|
| **Starter** | $29/mo | 1 persona, core skills, Telegram |
| **Pro** | $79/mo | 1 persona + 2 skill packs, priority support |
| **Agency** | $199/mo | 3 personas, unlimited skill packs, API access |

### One-Time Purchases

| Product | Price | Description |
|---------|-------|-------------|
| Setup Fee | $149-499 | White-glove onboarding (one-time) |
| Skill Packs | $29-99 | Email Mastery, Research Pro, etc. (one-time) |
| Custom Persona | $500+ | Build a persona for your specific needs |

### Revenue Math

- **Target:** 100 customers × $50 avg = **$5K MRR** in 6 months
- **Long-term:** 500 customers × $80 avg = **$40K MRR**

---

## Product Roadmap

### Phase 1: MVP (Weeks 1-4) — **TODAY**
- [x] Domain purchased (clawsrus.com)
- [x] Repo created
- [ ] Landing page with pricing
- [ ] Sign-up form (manual provisioning)
- [ ] 3 personas: Chief of Staff, Sales Expert, Personal Assistant
- [ ] 5 skill packs
- [ ] Manual payment (Stripe later)

### Phase 2: Automation (Weeks 5-8)
- [ ] Stripe integration
- [ ] Auto-provisioning (webhook → script)
- [ ] User dashboard
- [ ] Usage tracking

### Phase 3: Scale (Weeks 9-12)
- [ ] Additional personas (Fitness Buddy, Research Assistant)
- [ ] Skill pack marketplace
- [ ] API for power users
- [ ] Referral program

---

## Competitive Landscape

| Competitor | Revenue | What They Do | Weakness |
|------------|---------|--------------|----------|
| SimpleClaw | $33K/mo | 1-click deploy | No personalization |
| SetupClaw | $20K/mo | Manual setup | Not scalable |
| ClawWrapper | $12K/mo | SaaS template | For builders, not users |
| QuickClaw | $6K/mo | Mobile app | Generic, no persona |

**Our Edge:**  
Nobody is doing **persona-based** AI assistants. We're not competing on deployment speed — we're competing on **outcome**.

---

## Technical Stack

### What We Build
- **Frontend:** Next.js or static site (landing page)
- **Backend:** Node.js API (provisioning)
- **Database:** PostgreSQL (Supabase) — for user management
- **Payments:** Stripe
- **Hosting:** DigitalOcean / Hetzner (Docker) — customer instances
- **Runtime:** OpenClaw (per customer instance)

### Provisioning Flow
1. User signs up → Stripe webhook triggers
2. Script creates Docker container with OpenClaw
3. Persona + skills pre-loaded from templates
4. User receives Telegram/Discord welcome message
5. Done in ~10 minutes

---

## Go-To-Market

### Phase 1: Founder-Led Growth (Month 1)
**Target:** 10 paying customers

1. **Twitter/X presence** (@ClawsRUs)
   - Build in public
   - Share wins, learnings, demos
   - Engage with OpenClaw community

2. **Direct outreach**
   - OpenClaw Discord users struggling with setup
   - Twitter DMs to people asking about OpenClaw

3. **Content marketing**
   - Blog: "Why Generic AI Assistants Don't Work"
   - Blog: "How to Choose the Right AI Persona for Your Business"

### Phase 2: Community Growth (Months 2-3)
**Target:** 50 customers

1. **Product Hunt launch**
2. **Reddit** (r/OpenClaw, r/AI, r/SaaS)
3. **Referral program** ($10 credit per referral)

### Phase 3: Scale (Months 4-6)
**Target:** 100+ customers

1. **Partner channels** (agencies, consultants)
2. **SEO** (rank for "AI assistant for [role]")
3. **Paid ads** (if unit economics work)

---

## Success Metrics

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Customers | 5 | 25 | 100 |
| MRR | $500 | $3K | $8K |
| Churn | <10% | <8% | <5% |
| NPS | >40 | >50 | >60 |

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| OpenClaw changes/disappears | Low | We're building on top, not locked in |
| Competitor copies persona idea | Medium | Speed + community = defensible |
| API cost > revenue | Medium | Usage limits, tiered pricing |
| Support burden too high | High | Self-serve docs, tiered support |

---

## Team

- **Yaya** — Founder, Sales, Strategy
- **Gizmo** — Operations, Support, Content
- **Gremlin Garage** — Parent company / accelerator

---

## Contact

- Website: clawsrus.com
- Twitter: @ClawsRUs
- GitHub: github.com/yannick3010/clawsrus

---

*Last updated: 2026-02-16*
*Document status: Draft*
