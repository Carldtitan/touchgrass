---
mode: testing
max_steps: 25
target: chrome
---

# Auth Test — Sign Up and Land on Home

Verifies Requirement 1 (sign up) and 2.2 (land on Home after auth). Self-contained:
signs up a fresh user with a unique email so it never depends on prior data.

## Step 1
Go to http://localhost:3000

## Step 2
Click the "Sign up" control to open the sign up form.

## Step 3
Enter a unique email like kane-user-20260530@example.com, a password of at least 8 characters like grass1234, and a display name like Kane Tester.

## Step 4
Submit the sign up form by clicking "Sign up".

## Step 5
Verify the Home tab is shown: a bottom navigation bar is visible and a streak counter is present on screen.
