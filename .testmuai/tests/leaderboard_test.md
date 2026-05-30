---
mode: testing
max_steps: 30
target: chrome
---

# Leaderboard Test — Re-rank After Score Change

Verifies Requirement 5: the leaderboard orders users by score and re-ranks when a
score changes. Self-contained: signs up its own fresh user.

## Step 1
Go to http://localhost:3000

## Step 2
Sign up a fresh user: click "Sign up", enter a unique email like kane-board-20260530@example.com, password grass1234, and display name Kane Ranker, then submit.

## Step 3
Open the Leaderboard tab from the bottom navigation bar.

## Step 4
Verify the leaderboard lists users with a rank, display name, score, and streak, and that the current user's row is visually highlighted.
