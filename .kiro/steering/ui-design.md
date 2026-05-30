---
inclusion: always
---

# UI Design Rules

TouchGrass should feel like a real consumer social app, not a generic SaaS dashboard.

The UI should be:
- mobile-first
- social
- energetic
- clean
- lightly gamified
- trustworthy
- simple enough for daily use

## Stack

Use:
- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react

Use shadcn/ui primitives whenever available instead of hand-rolled components.

Use lucide-react icons only when they clarify meaning.

## Product Feel

TouchGrass is not an admin dashboard. It is a social habit/gamification app.

The product should feel like:
- a lightweight social app
- a daily habit tracker
- a points/streak game
- a photo-based activity log
- a leaderboard-driven challenge

It should not feel like:
- a generic SaaS dashboard
- a corporate analytics tool
- a childish mobile game
- a fake prototype with made-up social activity

## Layout Rules

Every major screen should have:
- clear page title
- short supporting text
- obvious primary action
- secondary action where relevant
- responsive layout
- polished empty state
- loading state
- error state

Use cards for grouped content.

Use generous spacing.

Avoid cramped layouts.

Avoid dense admin-style dashboards unless the screen is actually administrative.

## Visual Rules

Use:
- clear hierarchy
- readable typography
- strong but simple headings
- muted secondary text
- consistent spacing
- responsive grids
- rounded cards
- badges
- progress indicators
- streak indicators
- leaderboard rows
- profile progress summaries
- photo preview cards

Avoid:
- generic AI-looking purple gradient SaaS design
- fake social proof
- random decorative icons
- cluttered dashboards
- overdesigned game UI
- tiny text
- unclear primary actions
- inconsistent spacing
- UI that only works on desktop

## State Rules

Every major screen must handle:
- loading state
- empty state
- error state
- success state where relevant
- authenticated state where relevant
- unauthenticated state where relevant

Empty states should be polished and useful. They should tell the user what to do next.

## Component Rules

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

Do not hand-roll these components unless there is a clear reason.

Use lucide-react icons only when they improve comprehension.

## Mobile Rules

Design mobile-first.

The app should work well on:
- small phones
- large phones
- tablets
- desktop

Primary actions should be easy to tap.

Avoid layouts that require horizontal scrolling.

## Final UI Review

Before finishing any frontend task, check:
- Is the main user action obvious?
- Is the screen responsive?
- Does it work on mobile?
- Are spacing and typography consistent?
- Are loading, empty, error, and success states handled?
- Does the UI use real backend data instead of fake examples?
- Does it feel like a real social app rather than a SaaS dashboard?
