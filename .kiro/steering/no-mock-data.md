---
inclusion: always
---

# No Mock Data Rules

TouchGrass is a real app with real user accounts and real persisted data.

Do not create:
- mock users
- seed users
- fake hangouts
- fake comments
- fake reactions
- fake leaderboard rows
- fake points
- fake streaks
- fake social proof
- hardcoded production-looking arrays

Use:
- Supabase Auth for authentication
- Supabase Postgres for persisted app data
- Supabase Storage for uploaded photos

If there is no data, show a polished empty state.

If the user is not authenticated, show the appropriate unauthenticated state.

Browser localStorage must not be used as the source of truth for real app data.

Mock data is allowed only if explicitly requested for a visual-only prototype.

## Data Source Rules

Leaderboard data must come from real user scores.

Hangout feed data must come from real hangout records.

Comments must come from real comment records.

Reactions must come from real reaction records.

Profile stats must come from real user and hangout records.

Streaks and points must be calculated from real persisted activity.

## Empty State Rules

If the database is empty, do not fake activity.

Instead, show clear empty states such as:
- no hangouts yet
- no leaderboard entries yet
- no comments yet
- no reactions yet
- no badges earned yet

Each empty state should include a useful next action where appropriate.

## Testing Exception

Automated tests may create their own temporary users and records as part of the test flow.

Do not create persistent seed data for normal app behavior.
