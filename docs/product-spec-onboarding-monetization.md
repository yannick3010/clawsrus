# OpenClaw Product Spec: Onboarding & Monetization

**Version:** 1.0  
**Date:** 2026-02-17  
**Status:** Draft  
**Author:** Gizmo (PM)  
**Target:** Personal Assistant Persona (v1)

---

## Overview

This spec covers the product improvements needed to:
1. Reduce onboarding friction
2. Create a monetization pathway
3. Improve persona activation through structured onboarding

---

## Problem Statement

**Current state:**
- Onboarding requires Telegram download + config (high friction for non-technical users)
- No post-signup hub — users drop into Telegram with no guidance
- Personas have no onboarding flow — users don't understand value
- No subscription model — no clear monetization

**Target state:**
- Embedded web chat + optional Telegram
- Dashboard for all users (free tier)
- Persona-driven 7-day onboarding sequence
- Pro subscription with trial
- Rich signup data collection → personalized first message

---

## Data Collection Strategy

### What We Collect (Signup + Onboarding)

| Field | When | Why |
|-------|------|-----|
| Name | Signup | Personalization ("Hi Nick") |
| Email | Signup | Account, notifications |
| Role / Industry | Signup (optional) | Context for suggestions |
| What they need help with | Onboarding (Day 0) | Tailor capabilities |
| Communication style | Onboarding (Day 0) | Adjust verbosity/tone |
| Top priorities | Onboarding (Day 0) | First automation suggestions |

### The Magic Moment

**Current:** *"Hi! I'm your AI assistant."*

**Target:** *"Hi Nick! I know you want help with email and calendar. I've set up your inbox to triage messages and created a daily standup reminder for 9am. Want me to adjust anything?"*

**How it works:**
1. User answers preference questions (name, priorities, style)
2. Bot stores in `user.preferences`
3. Bot executes 1-2 instant setup actions based on answers
4. Bot references this in first proactive message

### Setup Actions (Auto-Configured)

Based on what user says they need help with:

| User says... | Bot auto-sets up... |
|--------------|---------------------|
| "email" | Email summary (daily digest) |
| "calendar" | Meeting reminder (30 min before) |
| "tasks" | Task reminder (daily at 9am) |
| "research" | Web search capability enabled |
| "notes" | Meeting notes template |

This makes the bot feel magical immediately — it *did something*, not just asked questions.

---

## Feature Breakdown

### 1. Embedded Web Chat

**Problem:** Telegram is a barrier for non-technical users.

**Solution:** Native web-based chat interface accessible immediately after signup.

**Scope:**
- Web client (React/HTML + JS)
- Connects to existing OpenClaw backend
- Real-time messaging (WebSocket or polling)
- Basic message UI (bubbles, timestamps)

**Not in scope:**
- Full dashboard features (see #2)
- Voice/video
- File attachments (v2)

**Priority:** HIGH  
**Effort:** Medium  
**Dependencies:** Backend APIs for message send/receive

---

### 2. User Dashboard (Free Tier)

**Problem:** No central place for users to manage their OpenClaw.

**Solution:** Web dashboard accessible to all users post-signup.

**Free tier features:**
- Profile management (name, preferences, timezone)
- Connected channels view (Telegram, Slack, etc.)
- Basic usage stats (message count, session time)
- Persona activation/deactivation
- Skill marketplace browser (read-only)
- Purchase skills (triggers payment flow)

**Scope:**
- React web app or static HTML + API
- User settings CRUD
- Channel connection status
- Usage metrics display

**Priority:** HIGH  
**Effort:** Medium  
**Dependencies:** #1 (web chat can share UI), #3 (subscription gating)

---

### 3. Subscription & Trial Gating

**Problem:** No monetization mechanism.

**Solution:** Tiered access with 7-day free trial.

**Tier structure:**

| Feature | Free | Pro |
|---------|------|-----|
| Web chat | ✅ | ✅ |
| Basic dashboard | ✅ | ✅ |
| Telegram channel | ✅ | ✅ |
| Custom personas | 1 | Unlimited |
| Advanced analytics | ❌ | ✅ |
| Priority support | ❌ | ✅ |
| Higher usage limits | ❌ | ✅ |
| API access | ❌ | ✅ |
| Team/multi-user | ❌ | ✅ |
| Skill purchases | ✅ | ✅ (20% platform fee on sales) |

**Trial mechanics:**
- 7-day trial starts on signup
- Trial ends → dashboard shows "Upgrade" prompt
- Grace period: 3 days (features continue working)
- Day 10: Features locked until upgrade

**Scope:**
- Stripe integration (or similar)
- Trial start date tracking
- Entitlement checks before granting access
- Payment flow UI in dashboard

**Priority:** HIGH  
**Effort:** Medium  
**Dependencies:** #2 (dashboard is where upgrade happens)

---

### 4. Progressive Telegram Invite

**Problem:** Asking for Telegram upfront adds friction.

**Solution:** Don't mention Telegram until after user has value.

**Flow:**
1. Signup → Web chat
2. User gets value (first 3-5 messages)
3. Around message 5-10: "Want to chat on Telegram too? You'll get mobile notifications."
4. If yes → simplified Telegram connect flow (QR code or deep link)

**Alternative for Telegram-lovers:**
- "Connect Telegram for faster notifications" as optional step in signup
- Default: off

**Priority:** MEDIUM  
**Effort:** Low

---

### 5. Persona Onboarding Scripts

**Problem:** Users don't understand what their persona can do.

**Solution:** Each persona has an onboarding script triggered on first conversation.

**Onboarding script fields (per persona):**
```json
{
  "onboarding": {
    "enabled": true,
    "welcome_message": "Hi! I'm your [persona name]. To work best for you...",
    "preference_questions": [
      {"key": "name", "prompt": "What should I call you?"},
      {"key": "work_style", "prompt": "How do you prefer to communicate?"},
      {"key": "top_priority", "prompt": "What's the most important thing I can help with?"}
    ],
    "suggestions": [
      {"trigger": "after_prefs", "message": "Based on what you told me, I can help with..."}
    ]
  }
}
```

**First-message behavior:**
1. User sends first message
2. Bot responds with welcome + first preference question
3. Capture answers → store in user preferences
4. Generate first-value suggestions

**Priority:** HIGH  
**Effort:** Medium

---

### 6. 7-Day Drip Onboarding Sequence

**Problem:** Single onboarding message isn't enough. Users need to be guided to value over time.

**Solution:** Persona runs a 7-day sequence of proactive messages.

**Sequence structure (Personal Assistant persona):**

| Day | Goal | Message Example |
|-----|------|-----------------|
| 0 | Welcome + prefs | "Hi! I'm your AI assistant. To work best for you, I need to learn a few things. What's your name, and what do you want help with?" |
| 1 | First value | "Based on what you told me, I've set up X and Y for you. Want me to show you what I automated?" |
| 2 | Use case reveal | "Here's something you might not know I can do: [capability relevant to user's stated priority]" |
| 3 | Workflow suggestion | "Want me to create a recurring task for you? I can remind you about X every week." |
| 4 | Social proof | "People in similar roles use me for: [list of common use cases]" |
| 5 | Skill showcase | "There's a skill in the marketplace that might help with [their domain]. Want me to show you?" |
| 6 | Upsell teaser | "You've got 1 day left on your free trial. Want me to show you Pro features?" |
| 7+ | Graduation | "You're all set! I'm here whenever you need me. Need anything specific?" |

**Technical implementation:**
- Persona config has `onboarding_sequence` array
- Each step has: `day_offset`, `message`, `trigger_condition`
- Cron job runs daily, checks users who signed up N days ago
- If user already activated Pro → skip upsell steps
- User can skip by saying "skip onboarding" or "I'm good"

**Skippable:** User can opt out at any time.

**Priority:** HIGH  
**Effort:** Medium  
**Dependencies:** #5 (onboarding scripts required first)

---

### 7. Skills Marketplace

**Problem:** No secondary revenue stream. Users need discoverable add-ons.

**Solution:** In-dashboard marketplace for purchasing/activating skills.

**Features:**
- Browse skills by category
- View skill details (description, reviews, price)
- Purchase (triggers payment)
- Activate/deactivate
- Developer upload (for skill creators)

**Revenue model:**
- Platform takes 20% on skill sales
- Rest goes to skill creator

**Scope:**
- Skill listing API
- Purchase flow (Stripe)
- Creator dashboard (upload, analytics, payout)

**Priority:** MEDIUM (for MVP)  
**Effort:** Medium-High

---

## Implementation Order

### Phase 1: Foundation (Weeks 1-3)
1. Embedded web chat (#1)
2. User dashboard - basic (#2)
3. Subscription + trial gating (#3)

### Phase 2: Activation (Weeks 4-6)
4. Persona onboarding scripts (#5)
5. 7-day drip sequence (#6)

### Phase 3: Growth (Weeks 7+)
6. Progressive Telegram invite (#4)
7. Skills marketplace (#7)

---

## Metrics to Track

- **Conversion:** Signup → Completed onboarding (sent 3+ messages)
- **Activation:** Users who reach day 7 of sequence
- **Retention:** Users active after 30 days
- **Trial → Paid:** Conversion rate from free to Pro
- **Feature adoption:** % users who enable Telegram, purchase skills

---

## Open Questions

1. **Telegram fallback:** If web chat has issues, do we require Telegram as backup?
2. **Pricing:** What does Pro cost? Monthly/yearly?
3. **Persona-specific onboarding:** Do we start with just Personal Assistant, or build framework first?
4. **Analytics:** What counts as "usage" for limits?

---

## Appendix: Persona Onboarding Config Example

```json
{
  "id": "personal-assistant",
  "name": "Personal Assistant",
  "description": "Your AI chief of staff",
  "onboarding": {
    "enabled": true,
    "welcome_message": "Hi! I'm your personal AI assistant. I'll help you stay organized, manage tasks, and handle the busywork so you can focus on what matters. To work best for you, I need to learn a few things first.",
    "preference_questions": [
      {
        "key": "name",
        "prompt": "What should I call you?",
        "storage": "user.preferred_name"
      },
      {
        "key": "communication_style",
        "prompt": "How do you prefer to communicate? (brief & direct / detailed / casual)",
        "storage": "user.communication_style"
      },
      {
        "key": "top_priorities",
        "prompt": "What's the most important thing I can help you with? (productivity / email / calendar / research / all of the above)",
        "storage": "user.top_priorities"
      }
    ],
    "onboarding_sequence": [
      {
        "day_offset": 0,
        "trigger": "first_message",
        "message": "Hi! I'm your personal AI assistant. I'll help you stay organized, manage tasks, and handle the busywork so you can focus on what matters. To work best for you, I need to learn a few things first. What should I call you?"
      },
      {
        "day_offset": 1,
        "trigger": "prefs_captured",
        "message": "Got it, [name]! Based on what you told me, I've set up daily task reminders and a weekly summary for you. Want me to show you what else I can do?"
      },
      {
        "day_offset": 2,
        "trigger": "always",
        "message": "Here's something you might not know I can do: I can read your emails, summarize them, and draft responses for you. Want me to connect your inbox?"
      },
      {
        "day_offset": 3,
        "trigger": "always",
        "message": "Want me to create a recurring task for you? I can remind you about meetings, follow-ups, or anything else on a regular schedule."
      },
      {
        "day_offset": 4,
        "trigger": "always",
        "message": "Most people in similar roles use me for: calendar management, email triage, meeting prep, and research. What would be most valuable for you?"
      },
      {
        "day_offset": 5,
        "trigger": "not_pro",
        "message": "There's a 'Meeting Notes' skill in the marketplace that automatically transcribes and summarizes your calls. Want me to show you?"
      },
      {
        "day_offset": 6,
        "trigger": "trial_user",
        "message": "You've got 1 day left on your free trial. Want me to show you Pro features like advanced analytics and custom workflows?"
      }
    ]
  }
}
```
