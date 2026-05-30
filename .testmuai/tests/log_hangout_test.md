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
Sign up a fresh user: click "Sign up", then enter a brand-new email address that has never been used before by appending the current timestamp digits, for example kane-log-1780000000@example.com but with your own different number, then enter the password grass1234 and the display name Kane Logger, then click "Sign up" to submit.

## Step 3
Open the log dialog by clicking the center Log control in the bottom navigation bar.

## Step 4
In the open "Log a hangout" dialog: set the photo file input to the local file at .testmuai/tests/fixtures/hangout.jpg, then click the "Gym" activity option (worth 20 points). Do not close or dismiss the dialog.

## Step 5
Click the "Log it" button to submit the hangout. The dialog should close on its own after a successful submit — do not dismiss it by clicking the backdrop.

## Step 6
On the Home feed, verify that a new feed post appears with an image element that has a non-empty source, and that the post shows "+20 points".
