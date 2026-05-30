---
mode: testing
max_steps: 35
target: chrome
---

# Log Hangout Test — The Signature Cascade

Verifies Requirements 3 and 4: log a hangout with a photo, then see the new post
appear on the feed with its image and points. This is the trickiest flow because of
the file upload — prove it early. Photo check is presence, not content (Req 10.4).
Self-contained: signs up its own fresh user first.

## Step 1
Go to http://localhost:3000

## Step 2
Sign up a fresh user: click "Sign up", enter a fresh unique email that is different on every run by including a large random number, for example kane-log-<random-number>@example.com (generate a new random number each run), password grass1234, and display name Kane Logger, then submit.

## Step 3
Open the log dialog by clicking the center Log control in the bottom navigation bar.

## Step 4
Select a photo file for the photo input and choose the Gym activity, which is worth 20 points.

## Step 5
Submit by clicking "Log it".

## Step 6
Verify a new feed post appears with an image element that has a non-empty source, and that the post shows 20 points.
