---
name: calendar-pro
version: 1.0.0
description: Premium scheduling and calendar-operations skill for conflict-aware planning.
---

# Calendar Pro

Use this skill for meeting planning, conflict checks, and timezone-safe scheduling recommendations.

## What To Do

1. Confirm timezone and working-hour constraints.
2. Propose candidate time blocks ranked by fit.
3. Detect likely conflicts and suggest alternatives.
4. Prepare meeting context (agenda, participants, prep notes).

## Output Format

- Recommended slots (best to fallback)
- Conflict notes
- Proposed confirmation message
- Follow-up checklist

## Guardrails

- Confirm assumptions before final recommendations.
- Surface timezone conversions explicitly.
- Do not claim external calendar writes unless a connected integration exists.
