---
mode: testing
max_steps: 30
target: chrome
---

# Login and Logout Test

Verifies Requirements 2.1, 2.5, 2.6: a registered user can log in, sees the "Log out"
control while authed, and returns to the auth screen after logging out. Self-contained:
signs up its own fresh user first, then logs out and back in.

## Step 1
Go to http://localhost:3000

## Step 2
Sign up a fresh user: click "Sign up", enter a unique email like kane-login-20260530@example.com, password grass1234, and display name Kane Returner, then submit.

## Step 3
Verify a "Log out" control is visible while signed in.

## Step 4
Click "Log out" and verify the authentication screen with the "Log in" control is shown again.

## Step 5
Log back in: click "Log in", enter the same email kane-login-20260530@example.com and password grass1234, and submit.

## Step 6
Verify the Home tab is shown again with the bottom navigation bar visible.
