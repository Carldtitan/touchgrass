---
test: ../log_hangout_test.md
status: passed
started: 2026-05-30T23:09:53.366Z
duration_s: 423
session_id: cb527005-f4be-4ee2-b629-00a57cd49e22
---

# Log Hangout Test — The Signature Cascade — Result

## Step 1 ✓ passed (1.09s)
md5: a1c337fdb3469e4c67b238ec6e913ab2
Go to http://localhost:3000

## Step 2 ✓ passed (134.4s)
md5: a814ea9f30a7476c7fdc1ee15514e50a
Sign up a fresh user: click "Sign up", then enter a brand-new email address that has never been used before by appending the current timestamp digits, for example kane-log-1780000000@example.com but with your own different number, then enter the password grass1234 and the display name Kane Logger, then click "Sign up" to submit.

## Step 3 ✓ passed (27.6s)
md5: 2f18bf107a416a2955f0a3eea4e8606f
Open the log dialog by clicking the center Log control in the bottom navigation bar.

## Step 4 ✓ passed (89.7s)
md5: 3e5a8e8db89337bbb215b9e967754b3b
In the open "Log a hangout" dialog: set the photo file input to the local file at .testmuai/tests/fixtures/hangout.jpg, then click the "Gym" activity option (worth 20 points). Do not close or dismiss the dialog.

## Step 5 ✓ passed (76s)
md5: 267406f6ff38a61807268964a8be5135
Click the "Log it" button to submit the hangout. The dialog should close on its own after a successful submit — do not dismiss it by clicking the backdrop.

## Step 6 ✓ passed (79.8s)
md5: 0ae6949cae21f5d33179a2b86c9f8ab1
On the Home feed, verify that a new feed post appears with an image element that has a non-empty source, and that the post shows "+20 points".
