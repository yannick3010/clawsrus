# Product Backlog & Ideas

**Purpose:** Brain dump for features, improvements, and explorations. Not prioritized. Move to specs when ready to build.

---

## Features (Not Yet Prioritized)

### Data Portability
- **What:** Allow users to export their data (preferences, memory, workflows)
- **Why:** Builds trust, reduces lock-in fear
- **Status:** Low priority
- **Notes:** Need to decide format (JSON? CSV? API?)

### Persona Auto-Updates
- **What:** When we improve Personal Assistant, existing users get updates automatically
- **Why:** Keeps product fresh, users benefit from improvements
- **Status:** Important but hairy
- **Challenges:** Versioning, backwards compatibility, user expectations, opt-out mechanism

### Analytics as Value Proof
- **What:** Show "time saved this week" or "tasks automated"
- **Why:** Retention hook, demonstrates ROI
- **Status:** Nice-to-have (Pro feature)
- **Challenges:** Hard to quantify accurately

### Trial Extension
- **What:** Users can request more than 7 days to evaluate
- **Why:** Builds goodwill, reduces pressure
- **Status:** Not needed (trial expires to Standard, not lockout)

### Team/Collaboration (Pro Tier)
- **What:** Multiple users sharing one assistant?
- **Why:** Could unlock SMB market
- **Status:** Unclear if this is Pro or Enterprise
- **Notes:** Enterprise = multi-agent. Pro = shared assistant? Needs thought.

### Skill Bundles
- **What:** "Productivity Pack" (3 skills for $20 vs $27 individually)
- **Why:** Increases average order value
- **Status:** Later (after marketplace v1)

### White-Label (Enterprise+)
- **What:** Agencies can rebrand ClawsRus for their clients
- **Why:** Opens enterprise/agency channel
- **Status:** Far future
- **Challenges:** Custom domains, branding, billing

### Voice Interface
- **What:** Talk to your assistant (voice input/output)
- **Why:** Accessibility, convenience
- **Status:** v2+
- **Notes:** Requires TTS/STT integration

### Mobile App
- **What:** Native iOS/Android app
- **Why:** Better than web chat for mobile users
- **Status:** After web chat + Telegram work
- **Notes:** Telegram may be "good enough" for mobile

### API Access (Pro Feature)
- **What:** Users can call ClawsRus programmatically
- **Why:** Power users, integrations
- **Status:** Defined in tier spec, not built yet

---

## Growth Ideas

### Referral Program
- **What:** "Invite a friend, get 1 month free"
- **Why:** Viral growth
- **Status:** Prioritized (Phase 3)
- **Notes:** Needs spec

### Content Marketing
- **What:** Blog, case studies, use case guides
- **Why:** SEO, education, trust
- **Status:** Ongoing
- **Notes:** Separate from product

### Community
- **What:** Discord, Slack, or forum for users
- **Why:** Support, feedback, engagement
- **Status:** Low priority (focus on product first)

### Affiliate Program
- **What:** Pay partners for referrals (vs user referrals)
- **Why:** Partner channel
- **Status:** Post-PMF

---

## UX Improvements

### Onboarding Skip
- **What:** "I already know what I want, skip intro"
- **Why:** Respects power users
- **Status:** Nice-to-have
- **Notes:** Still capture preferences, just faster

### Progressive Telegram Invite
- **What:** Offer Telegram after user gets value (msg 5-10)
- **Why:** Reduces signup friction
- **Status:** Defined in onboarding spec

### Dark Mode
- **What:** Dashboard + chat dark theme
- **Why:** User preference, reduces eye strain
- **Status:** Low priority

### Keyboard Shortcuts
- **What:** Cmd+K to open chat, etc.
- **Why:** Power user efficiency
- **Status:** v2

---

## Technical Debt / Infrastructure

### Rate Limiting
- **What:** Prevent abuse, manage API costs
- **Why:** Cost control
- **Status:** Need before scale

### Monitoring & Alerts
- **What:** Uptime, error tracking, performance
- **Why:** Reliability
- **Status:** Basic version needed ASAP

### Multi-Region
- **What:** Deploy in multiple regions for speed
- **Why:** Global performance
- **Status:** Post-PMF

---

## Explorations (No Decision Yet)

### Personas Beyond Personal Assistant
- **What:** Sales Coach, Developer Assistant, Creative Writer, etc.
- **Why:** Expands TAM
- **Status:** After PA is solid
- **Notes:** Each needs its own onboarding flow

### Integrations
- **What:** Slack, Google Calendar, Gmail, Notion, etc.
- **Why:** Make assistant more powerful
- **Status:** Skills marketplace covers some of this
- **Notes:** First-party vs third-party?

### Memory Persistence (Long-Term)
- **What:** Assistant remembers everything across months/years
- **Why:** More valuable over time
- **Status:** Needs architecture thought
- **Notes:** Storage costs, privacy, retrieval speed

### Voice Cloning
- **What:** Your assistant sounds like you (or someone else)
- **Why:** Personalization, branding
- **Status:** Far future
- **Challenges:** Ethics, costs, technical complexity

---

## Rejected Ideas (Archive)

### Third-Party Skill Marketplace
- **What:** Let developers sell skills, we take 20%
- **Why:** Ecosystem growth
- **Rejected:** All skills are first-party to start (we keep 100%)
- **Could revisit:** Post-PMF if we want ecosystem play

### Freemium with Hard Paywall
- **What:** Free users hit message limit, must upgrade
- **Rejected:** Soft landing (Standard tier) builds more trust
- **Could revisit:** If economics don't work

---

## How to Use This File

1. **Brainstorm here first** — Don't bloat specs with unvalidated ideas
2. **Tag priority when obvious** — High/Medium/Low or phase number
3. **Move to spec when ready** — Create dedicated spec doc when it's time to build
4. **Archive rejected ideas** — Keep for historical context

---

_Last updated: 2026-02-17_
