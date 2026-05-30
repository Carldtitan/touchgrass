---
name: social-gamification-ui
description: Use this skill when designing or implementing gamified social app interfaces, including activity logging, session completion, points, streaks, leaderboards, profiles, reactions, comments, and progress feedback.
---

# Social Gamification UI Skill

## Purpose

Use this skill to design and implement TouchGrass-style social gamification interfaces.

The goal is to make social activity logging feel rewarding, clear, and habit-forming without making the product feel childish or fake.

## Product Context

TouchGrass is a real social app.

Users:
- sign up with real accounts
- log real in-person hangouts
- optionally upload a photo
- earn points
- maintain daily streaks
- react to posts
- comment on posts
- compete on leaderboards
- view progress and badges

Logging is honor-system.

The app does not verify whether people actually went outside.

## When To Use This Skill

Use this skill when working on:
- hangout logging
- photo upload flows
- feed posts
- session completion screens
- points summaries
- streak UI
- leaderboard UI
- profile progress
- badge displays
- comments
- reactions
- daily challenge or habit loops
- social activity cards

## Design Direction

The UI should feel:
- social
- energetic
- game-like
- mobile-first
- modern
- trustworthy
- easy to use daily

It should not feel:
- childish
- fake
- overly corporate
- like a generic SaaS dashboard
- like a crypto/finance leaderboard
- like a static prototype

## UI Patterns

Use where appropriate:
- large activity logging card
- photo preview card
- points earned summary
- streak indicator
- progress bar
- badge row
- leaderboard row
- profile stats card
- feed post card
- reaction button
- comment thread
- daily status card
- empty feed prompt
- success confirmation after logging

## TouchGrass Flow Guidance

For a hangout logging flow:

1. Make the primary action obvious.
2. Let the user describe the hangout.
3. Let the user upload a photo.
4. Show upload/loading feedback.
5. Submit to the real backend.
6. On success, show points/streak feedback.
7. Show the new post in the feed from real backend data.
8. Do not fake other users or activity.

For a leaderboard flow:

1. Use real user scores.
2. Show rank clearly.
3. Show current user position where possible.
4. Use readable rows.
5. Show an empty state if there are no records.
6. Do not create fake leaderboard examples.

For a profile flow:

1. Show real user stats.
2. Show real streak and score.
3. Show real badges.
4. Show real hangout history.
5. If nothing exists yet, show an empty state and prompt the user to log their first hangout.

## Component Rules

Use:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react

Use shadcn/ui components for:
- Button
- Card
- Tabs
- Dialog
- Avatar
- Badge
- Input
- Textarea
- Select
- DropdownMenu
- form-related components where appropriate

Use lucide-react icons only when they improve clarity.

## Required States

Every social/gamification screen should handle:
- unauthenticated state
- loading state
- empty state
- upload-in-progress state where relevant
- submission success state where relevant
- submission error state where relevant

## Data Realism Rules

Do not create:
- fake users
- fake posts
- fake hangouts
- fake comments
- fake reactions
- fake points
- fake streaks
- fake leaderboard entries
- hardcoded social proof

Use real Supabase data.

If the app has no data, show a polished empty state.

## Copy Style

Use copy that is clear, short, and slightly playful.

Avoid:
- cringe motivational copy
- exaggerated hype
- fake urgency
- corporate jargon
- long explanations

Good examples:
- Log your first hangout
- No hangouts yet
- You have not touched grass today
- Keep your streak alive
- Add a photo from your hangout
- See where you rank

## Anti-Patterns

Avoid:
- generic SaaS dashboard layout
- fake demo data
- hardcoded leaderboard names
- overdesigned game UI
- childish badges
- unreadable gradients
- cluttered feed cards
- unclear point calculations
- icons used only as decoration
- desktop-only interaction patterns

## Final Self-Review Checklist

Before finishing, verify:

- Does this feel like a real social app?
- Is the screen mobile-first?
- Is the main action obvious?
- Are points, streaks, and leaderboard data real?
- Are loading, empty, error, and success states handled?
- Is there any fake social activity?
- Does the design feel lightly gamified but not childish?
- Does the UI avoid generic SaaS dashboard patterns?
- Can a new user understand what to do next?
