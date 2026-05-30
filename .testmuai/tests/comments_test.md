---
mode: testing
max_steps: 40
target: chrome
---

# Comments Test — Note Becomes Caption, Plus Live Commenting

Verifies Requirement 4.4: the optional note entered when logging a hangout is
persisted and rendered as the post's first comment (its caption), the comment
count reflects it, and a freshly typed comment appears live on the feed.
Self-contained: signs up its own fresh user first. Photo check is presence, not
content (Req 10.4).

## Step 1
Go to http://localhost:3000

## Step 2
Sign up a fresh user: click "Sign up", enter a unique email like kane-comment-20260530@example.com, password grass1234, and display name Kane Commenter, then submit.

## Step 3
Open the log dialog by clicking the center Log control in the bottom navigation bar.

## Step 4
Select a photo file for the photo input and choose the Gym activity, which is worth 20 points.

## Step 5
In the "Note (optional)" field, type the caption: Best leg day ever.

## Step 6
Submit by clicking "Log it".

## Step 7
Verify a new feed post appears with an image element that has a non-empty source, and that the caption text "Best leg day ever" is shown as a comment on that post.

## Step 8
In the comment input on that post, type a second comment: Keep it up, then click "Post".

## Step 9
Verify the comment "Keep it up" now appears on the post and the post shows a comment count of 2.
