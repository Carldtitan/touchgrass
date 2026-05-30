---
mode: testing
max_steps: 35
target: chrome
---

# Streak and Skip-A-Day Test

Verifies Requirements 7 and 8: logging sets the streak, and "Skip a day" advances the
evaluation date and re-evaluates the streak in the UI. The math itself is unit-tested;
Kane confirms the rendered number. Self-contained: signs up its own fresh user.

## Step 1
Go to http://localhost:3000

## Step 2
Sign up a fresh user: click "Sign up", enter a fresh unique email that is different on every run by including a large random number, for example kane-streak-<random-number>@example.com (generate a new random number each run), password grass1234, and display name Kane Streaker, then submit.

## Step 3
Log a hangout: open the log dialog from the center Log control, select a photo, choose the Hike activity worth 50 points, and click "Log it".

## Step 4
Verify the streak counter shows 1.

## Step 5
Click the "Skip a day" control twice to advance the evaluation date two days without logging.

## Step 6
Verify the streak counter shows 0, because two or more days passed without a log.
