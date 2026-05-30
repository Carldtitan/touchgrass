---
mode: testing
max_steps: 35
target: chrome
---

# Profile and Badges Test

Verifies Requirement 6: the profile shows stats and unlocks the "First Steps" badge
after the first logged hangout. Self-contained: signs up its own fresh user.

## Step 1
Go to http://localhost:3000

## Step 2
Sign up a fresh user: click "Sign up", enter a fresh unique email that is different on every run by including a large random number, for example kane-prof-<random-number>@example.com (generate a new random number each run), password grass1234, and display name Kane Profiler, then submit.

## Step 3
Log one hangout: open the log dialog from the center Log control, select a photo, choose the Coffee activity worth 10 points, and click "Log it".

## Step 4
Open the Profile tab from the bottom navigation bar.

## Step 5
Verify the profile shows the display name, a score, a streak, and the "First Steps" badge unlocked.
