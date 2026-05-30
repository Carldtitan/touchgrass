---
mode: testing
max_steps: 25
target: chrome
---

# Empty State Test

Verifies Requirement 4.8 and 12.3: a brand-new user with no hangouts sees the empty-feed
message "No grass touched yet — be the first" rather than seed data. Self-contained:
signs up its own fresh user.

## Step 1
Go to http://localhost:3000

## Step 2
Sign up a fresh user: click "Sign up", enter a unique email like kane-empty-20260530@example.com, password grass1234, and display name Kane Fresh, then submit.

## Step 3
On the Home tab, verify the empty-state message "No grass touched yet — be the first" is visible and no feed posts are shown.
