---
name: frontend-product-design
description: Use this skill when creating, improving, or reviewing frontend UI for production web apps. Applies to layout, visual hierarchy, responsive design, shadcn/ui component usage, loading states, empty states, error states, and overall product usability.
---

# Frontend Product Design Skill

## Purpose

Use this skill to create production-quality frontend interfaces.

The goal is not just to make screens look nicer. The goal is to make the product easier to understand, easier to use, more visually coherent, and more realistic.

## When To Use This Skill

Use this skill when:
- creating a new page
- redesigning a page
- improving a component
- reviewing frontend UI
- adding loading, empty, error, or success states
- implementing responsive layouts
- improving visual hierarchy
- replacing generic UI with product-specific UI

## Stack Assumptions

Use:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react

Use shadcn/ui components whenever possible.

Use lucide-react icons only when they clarify meaning.

## Design Principles

1. Design mobile-first.
2. Make the primary action obvious.
3. Use clear visual hierarchy.
4. Prefer simple and memorable screens over cluttered screens.
5. Use real product context instead of generic placeholder UI.
6. Handle real app states, not just the happy path.
7. Keep spacing, typography, borders, shadows, and radius consistent.
8. Avoid fake data.

## Layout Rules

Every major screen should include:
- page title
- short supporting copy
- primary action
- secondary action where relevant
- main content area
- empty state when no data exists
- loading state while fetching
- error state when something fails

Use:
- max-width containers for readable layouts
- cards for grouped content
- responsive grids
- consistent spacing
- clear section headers

Avoid:
- cramped layouts
- walls of text
- too many buttons in one area
- desktop-only layouts
- generic dashboard layouts unless the screen is actually administrative

## Component Rules

Use shadcn/ui for:
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

Do not hand-roll these components unless there is a specific reason.

## Visual Style Rules

Default to:
- clean layout
- strong headings
- readable body text
- muted secondary text
- rounded cards
- subtle borders
- restrained shadows
- clear calls to action
- consistent spacing

Avoid:
- random gradients
- generic AI-looking SaaS visuals
- unnecessary decoration
- inconsistent card styles
- icons without meaning
- childish game visuals unless explicitly requested

## Required UI States

For each relevant screen or component, handle:
- loading state
- empty state
- error state
- success state
- authenticated state
- unauthenticated state

Empty states should explain:
- what is missing
- why the screen is empty
- what the user can do next

## Accessibility Basics

Use:
- semantic HTML where possible
- readable contrast
- clear button labels
- visible focus states
- accessible form labels
- meaningful alt text for uploaded or displayed images where appropriate

Avoid:
- icon-only buttons without labels
- tiny tap targets
- unclear form errors
- text that is too small on mobile

## Data Realism

Do not create fake users, fake posts, fake comments, fake reactions, fake leaderboard rows, fake points, or fake streaks.

If data is missing, show an empty state.

If data is loading, show a loading state.

If data fails to load, show an error state.

## Final Self-Review Checklist

Before finishing frontend work, verify:

- Is the screen responsive?
- Does it work on mobile?
- Is the primary action obvious?
- Is the visual hierarchy clear?
- Are spacing and typography consistent?
- Are shadcn/ui components used correctly?
- Are loading, empty, error, and success states handled?
- Is real backend data used instead of fake data?
- Does the screen feel production-ready?
