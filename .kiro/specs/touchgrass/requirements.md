# Requirements Document

## Introduction

TouchGrass is a mobile-first web application that gamifies real-world socializing. Real users sign up, log in-person hangouts with a required photo, earn points based on a fixed activity list, maintain a daily streak, unlock milestone badges, and compete on a leaderboard. Logging is honor-system: the application does not verify that a user physically went outside. The application starts with no seed data and fills exclusively with real, persisted data as people sign up and use it.

The application is built with React, Vite, and TypeScript on the frontend; Tailwind CSS and shadcn/ui for components; lucide-react for icons; and Supabase for authentication, a Postgres database, and photo storage. The product targets a polished, premium, mobile-first consumer social aesthetic while preserving deterministic core logic and automated-browser testability.

This document defines the requirements for the Minimum Viable Product (MVP): real authentication, real photo upload, four tabs (Home, Log, Leaderboard, Profile), and the streak, score, and leaderboard rules.

## Glossary

- **TouchGrass_App**: The complete web application, including frontend and Supabase backend, that this document specifies.
- **Auth_Service**: The Supabase Authentication subsystem responsible for email-and-password sign up, log in, and session management.
- **Database**: The Supabase Postgres database storing users, hangouts, reactions, and comments.
- **Storage_Service**: The Supabase Storage subsystem storing uploaded hangout photos and serving their public URLs.
- **Profile**: A persisted record for a registered user containing a display name, total score, current streak, last-log date, and unlocked badges.
- **Current_User**: The user associated with the active authenticated session.
- **Hangout**: A persisted record of a logged real-world activity, containing the poster, an activity type, a photo URL, optional tagged users, points earned, and a creation timestamp.
- **Activity_Type**: One member of the fixed set {Coffee, Gym, Dinner, Hike} with fixed point values {Coffee=10, Gym=20, Dinner=30, Hike=50}.
- **Score**: The cumulative sum of points a user has earned from logged Hangouts.
- **Streak**: A non-negative integer count of consecutive calendar days on which a user has logged at least one Hangout, evaluated per the Streak Rules.
- **Streak_Evaluation_Date**: The calendar date used by the TouchGrass_App to evaluate streak increases and resets, which is normally the current real date and which the Skip_A_Day_Control can advance by one day.
- **Cheer**: A reaction a user adds to a Hangout, counted per Hangout.
- **Comment**: A text response a user adds to a Hangout, counted per Hangout.
- **Badge**: A milestone award unlocked when a user meets a defined condition. The defined badges are "First Steps", "Weekend Warrior", and "On Fire".
- **Leaderboard**: The ranked list of all registered users ordered by Score and the defined tie-break rules.
- **Feed**: The Home tab list of Hangouts from all users ordered newest first.
- **Log_Dialog**: The shadcn Dialog used to create a Hangout.
- **Skip_A_Day_Control**: A developer control that advances the Streak_Evaluation_Date by one calendar day to demonstrate streak increases and resets on demand.
- **Bottom_Tab_Bar**: The fixed navigation bar containing the Home, Log, Leaderboard, and Profile tabs.
- **Design_Token**: A named color, spacing, or typography value defined as a CSS variable or Tailwind theme token.

## Requirements

### Requirement 1: User Sign Up

**User Story:** As a new visitor, I want to create an account with my email, password, and display name, so that I can start logging hangouts and earning points.

#### Acceptance Criteria

1. WHILE no authenticated session exists, THE TouchGrass_App SHALL display an authentication screen containing a control labeled "Sign up" and a control labeled "Log in".
2. WHEN a visitor submits the sign up form with an email in valid email address format, a password of at least 8 characters, and a display name of 1 to 50 characters, THE Auth_Service SHALL create a new authentication account for that email.
3. WHEN the Auth_Service creates a new authentication account, THE TouchGrass_App SHALL create a Profile record in the Database for that account with the submitted display name, a Score of 0, a Streak of 0, and zero unlocked Badges.
4. IF a visitor submits the sign up form with an email that already has an account, THEN THE TouchGrass_App SHALL display an error message stating that the email is already registered and SHALL leave the existing account unchanged.
5. IF a visitor submits the sign up form with an empty email, an empty password, or an empty display name, THEN THE TouchGrass_App SHALL display a validation message identifying the missing field and SHALL NOT submit the form.
6. WHEN sign up completes successfully, THE TouchGrass_App SHALL establish an authenticated session for the new user and SHALL display the Home tab.
7. IF a visitor submits the sign up form with a non-empty email that is not in valid email address format, THEN THE TouchGrass_App SHALL display a validation message indicating that the email format is invalid and SHALL NOT submit the form.
8. IF a visitor submits the sign up form with a password shorter than 8 characters or a display name longer than 50 characters, THEN THE TouchGrass_App SHALL display a validation message identifying the field that violates its length constraint and SHALL NOT submit the form.
9. IF the Auth_Service or the Database fails to create the authentication account or the Profile record during sign up, THEN THE TouchGrass_App SHALL display an error message indicating that sign up could not be completed, SHALL NOT establish an authenticated session, and SHALL NOT retain a Profile record that has no corresponding authentication account.

### Requirement 2: User Log In and Log Out

**User Story:** As a registered user, I want to log in and log out, so that I can access my account and end my session securely.

#### Acceptance Criteria

1. WHEN a registered user submits the log in form with an email and password that match a registered account, THE Auth_Service SHALL establish an authenticated session for that user.
2. WHEN an authenticated session is established, THE TouchGrass_App SHALL display the Home tab with the Bottom_Tab_Bar visible and SHALL hide the authentication screen.
3. IF a user submits the log in form with an email and password that do not match a registered account, THEN THE TouchGrass_App SHALL display an error message stating that the credentials are invalid, THE Auth_Service SHALL NOT establish an authenticated session, and THE TouchGrass_App SHALL continue to display the authentication screen.
4. IF a user submits the log in form with the email field or the password field left empty, THEN THE TouchGrass_App SHALL display an error message indicating that the empty field is required and THE Auth_Service SHALL NOT establish an authenticated session.
5. WHILE an authenticated session exists, THE TouchGrass_App SHALL display a control labeled "Log out".
6. WHEN the Current_User activates the "Log out" control, THE Auth_Service SHALL end the authenticated session, THE TouchGrass_App SHALL hide the application, and THE TouchGrass_App SHALL display the authentication screen.
7. WHEN the TouchGrass_App loads with an existing session that has not been ended recognized by the Auth_Service, THE TouchGrass_App SHALL display the Home tab with the Bottom_Tab_Bar visible without requiring the user to log in again.
8. WHEN the TouchGrass_App loads with no existing session, THE TouchGrass_App SHALL display the authentication screen.

### Requirement 3: Log a Hangout

**User Story:** As a logged-in user, I want to log a hangout with a photo and an activity, so that I earn points and share it on the feed.

#### Acceptance Criteria

1. WHILE an authenticated session exists, THE TouchGrass_App SHALL display a center control in the Bottom_Tab_Bar that opens the Log_Dialog.
2. THE Log_Dialog SHALL contain a photo input of type file, a selectable list of the four Activity_Types with their point values, an optional control to tag other registered users, and a submit control labeled "Log it".
3. IF the Current_User activates "Log it" without selecting a photo, THEN THE TouchGrass_App SHALL display a validation message stating that a photo is required and SHALL NOT create a Hangout.
4. IF the Current_User activates "Log it" without selecting an Activity_Type, THEN THE TouchGrass_App SHALL display a validation message stating that an activity is required and SHALL NOT create a Hangout.
5. WHILE a photo upload is in progress, THE TouchGrass_App SHALL display an upload progress indicator and SHALL disable the "Log it" control.
6. WHEN the Current_User submits a valid Hangout, THE Storage_Service SHALL store the selected photo and SHALL return a non-empty photo URL.
7. WHEN the Storage_Service returns a photo URL, THE TouchGrass_App SHALL create a Hangout record in the Database containing the Current_User as poster, the selected Activity_Type, the returned photo URL, any tagged users, the activity's point value, and a creation timestamp.
8. WHEN a Hangout record is created, THE TouchGrass_App SHALL add the Activity_Type's point value to the Current_User's Score and SHALL persist the updated Score in the Database.
9. WHEN a Hangout record is created, THE TouchGrass_App SHALL update the Current_User's Streak according to Requirement 7.
10. WHEN a Hangout is created successfully, THE TouchGrass_App SHALL display a celebration animation and SHALL close the Log_Dialog.
11. IF the photo upload fails, THEN THE TouchGrass_App SHALL display an error message stating that the upload failed, SHALL NOT create a Hangout record, SHALL NOT change the Current_User's Score, and SHALL keep the Log_Dialog open.

### Requirement 4: Home Feed

**User Story:** As a logged-in user, I want to see a feed of everyone's hangouts, so that I can keep up with my friends and cheer them on.

#### Acceptance Criteria

1. WHEN the Current_User opens the Home tab, THE TouchGrass_App SHALL display all Hangout records from all users ordered by creation timestamp from newest to oldest.
2. THE TouchGrass_App SHALL display each Feed post with the poster's display name, the poster's avatar, the activity emoji, the tagged users, the points earned, and a relative time-ago label.
3. THE TouchGrass_App SHALL display each Feed post with an image element whose source is the Hangout's stored photo URL.
4. THE TouchGrass_App SHALL display each Feed post with a reaction control labeled "Cheer" showing the current Cheer count and a Comment count.
5. WHEN the Current_User activates the "Cheer" control on a Feed post, THE TouchGrass_App SHALL persist a Cheer for that Hangout in the Database and SHALL display the updated Cheer count.
6. THE TouchGrass_App SHALL display a header on the Home tab showing the Current_User's Streak as a flame icon with the Streak number.
7. IF the Current_User has not logged a Hangout on the current Streak_Evaluation_Date, THEN THE TouchGrass_App SHALL display a banner with the text "You haven't touched grass today."
8. WHILE no Hangout records exist, THE TouchGrass_App SHALL display an empty-state message with the text "No grass touched yet — be the first".
9. WHILE one or more Hangout records exist, THE TouchGrass_App SHALL display the Feed posts and SHALL NOT display the empty-state message.

### Requirement 5: Leaderboard

**User Story:** As a competitive user, I want to see how my score ranks against everyone else, so that I stay motivated to touch grass.

#### Acceptance Criteria

1. WHEN the Current_User opens the Leaderboard tab, THE TouchGrass_App SHALL display all registered users ordered by Score from highest to lowest.
2. WHERE two or more users have an equal Score, THE TouchGrass_App SHALL order those users by Streak from highest to lowest.
3. WHERE two or more users have an equal Score and an equal Streak, THE TouchGrass_App SHALL order those users alphabetically by display name in ascending order, and SHALL maintain this ordering of all users independently of whether the Leaderboard tab is displayed.
4. THE TouchGrass_App SHALL display each Leaderboard row with the user's rank, avatar, display name, Score, and Streak.
5. THE TouchGrass_App SHALL visually highlight the Leaderboard row that belongs to the Current_User.
6. WHEN a user's Score changes, THE TouchGrass_App SHALL re-order the Leaderboard so that the displayed ranking enforces the ordering rules in Acceptance Criteria 1 through 3.

### Requirement 6: Profile and Badges

**User Story:** As a logged-in user, I want a profile showing my stats, badges, and hangout history, so that I can track my progress.

#### Acceptance Criteria

1. WHEN the Current_User opens the Profile tab, THE TouchGrass_App SHALL display the Current_User's avatar, display name, Streak, and total Score.
2. THE TouchGrass_App SHALL display the Current_User's unlocked Badges by name on the Profile tab.
3. THE TouchGrass_App SHALL display the Current_User's own Hangout records as a photo grid ordered by creation timestamp from newest to oldest.
4. WHEN the Current_User's total count of logged Hangouts reaches 1, THE TouchGrass_App SHALL unlock the "First Steps" Badge for the Current_User and SHALL persist it in the Database.
5. WHEN the Current_User's total count of logged Hangouts reaches 5, THE TouchGrass_App SHALL unlock the "Weekend Warrior" Badge for the Current_User and SHALL persist it in the Database.
6. WHILE the Current_User's total count of logged Hangouts is fewer than 5, THE TouchGrass_App SHALL keep the "Weekend Warrior" Badge locked for the Current_User.
7. WHEN the Current_User's Streak reaches 7, THE TouchGrass_App SHALL unlock the "On Fire" Badge for the Current_User and SHALL persist it in the Database.

### Requirement 7: Streak Rules

**User Story:** As a logged-in user, I want my daily streak to increase when I log on consecutive days and reset when I miss a day, so that the streak reflects my consistency.

#### Acceptance Criteria

1. WHEN the Current_User logs the first Hangout on a Streak_Evaluation_Date that is exactly one calendar day after the Current_User's last-log date, THE TouchGrass_App SHALL increase the Current_User's Streak by 1.
2. WHEN the Current_User logs a Hangout and the Current_User has no recorded last-log date, THE TouchGrass_App SHALL set the Current_User's Streak to 1.
3. WHEN the Current_User logs an additional Hangout on a Streak_Evaluation_Date equal to the Current_User's last-log date, THE TouchGrass_App SHALL leave the Current_User's Streak unchanged.
4. WHEN the Current_User logs the first Hangout on a Streak_Evaluation_Date that is two or more calendar days after the Current_User's last-log date, THE TouchGrass_App SHALL set the Current_User's Streak to 1.
5. WHEN the Current_User logs a Hangout, THE TouchGrass_App SHALL set the Current_User's last-log date to the current Streak_Evaluation_Date.
6. WHEN the TouchGrass_App evaluates the Current_User's Streak on a Streak_Evaluation_Date that is two or more calendar days after the Current_User's last-log date, THE TouchGrass_App SHALL set the Current_User's Streak to 0.

### Requirement 8: Skip A Day Developer Control

**User Story:** As a tester or demoer, I want to advance the streak-evaluation date by one day on demand, so that I can demonstrate streak increases and resets without waiting real days.

#### Acceptance Criteria

1. WHILE an authenticated session exists, THE TouchGrass_App SHALL display a control labeled "Skip a day".
2. WHEN the Current_User activates the "Skip a day" control, THE TouchGrass_App SHALL advance the Streak_Evaluation_Date by exactly one calendar day.
3. WHEN the Streak_Evaluation_Date advances, THE TouchGrass_App SHALL re-evaluate the Current_User's Streak according to Requirement 7, including when the Current_User has no recorded last-log date, in which case THE TouchGrass_App SHALL set the Current_User's Streak to 0.
4. WHEN the Streak_Evaluation_Date advances and the Current_User's Streak changes, THE TouchGrass_App SHALL display the updated Streak number on the Home tab and the Profile tab.

### Requirement 9: Visual Design System

**User Story:** As a user, I want a polished, premium, mobile-first interface, so that the app feels like a real consumer social app.

#### Acceptance Criteria

1. THE TouchGrass_App SHALL define the color palette, the spacing scale of 4, 8, 12, 16, 24, and 32 pixels, and the Inter typography as Design_Tokens.
2. THE TouchGrass_App SHALL apply colors, spacing, and typography through Design_Tokens and SHALL NOT use arbitrary hex color values or arbitrary pixel values in components.
3. THE TouchGrass_App SHALL render the application as a centered phone-width column with a maximum width of 430 pixels and a fixed Bottom_Tab_Bar.
4. THE TouchGrass_App SHALL use the grass-green accent color defined as Design_Token #22C55E for primary actions, the streak flame, the active tab, and highlights.
5. THE TouchGrass_App SHALL build interactive components from shadcn/ui primitives including Button, Card, Tabs, Dialog, Avatar, Badge, and Input.
6. THE TouchGrass_App SHALL render user avatars as colored circles displaying the user's initials.
7. WHEN the Current_User hovers over or activates an interactive control, THE TouchGrass_App SHALL apply a transition effect to that control.

### Requirement 10: Testability and Determinism

**User Story:** As an automated browser agent, I want stable labels, test identifiers, and deterministic behavior, so that I can sign up, log in, upload a photo, and verify results reliably.

#### Acceptance Criteria

1. THE TouchGrass_App SHALL label interactive controls with the stable, human-readable text "Sign up", "Log in", "Log it", "Cheer", "Skip a day", and "Log out".
2. THE TouchGrass_App SHALL implement the photo upload as a standard input element of type file that accepts a file set programmatically.
3. THE TouchGrass_App SHALL assign data-testid attributes to the streak counter, each Leaderboard row including the user's display name, each Feed post, each Feed post image element, the Score display, and each Badge item.
4. WHEN a Hangout is created successfully, THE TouchGrass_App SHALL render the new Feed post with an image element whose source attribute is non-empty and equals the Hangout's stored photo URL.
5. IF the new Feed post image element fails to load after a successful Hangout creation, THEN THE TouchGrass_App SHALL roll back the Hangout creation by removing the Hangout record and reverting the associated Score and Streak changes.
6. THE TouchGrass_App SHALL display the Streak number, each Score, the Leaderboard order, and each Badge name as readable on-screen text.
7. WHERE the same actions are applied to the same persisted state, THE TouchGrass_App SHALL produce the same on-screen result.

### Requirement 11: Local Setup and Configuration

**User Story:** As a developer, I want to run the app locally with one command and clear setup docs, so that I can build and test it quickly.

#### Acceptance Criteria

1. WHEN a developer runs the documented single start command, THE TouchGrass_App SHALL serve the frontend at http://localhost:3000.
2. THE TouchGrass_App SHALL read the Supabase project URL and Supabase anon key from a .env file.
3. THE TouchGrass_App SHALL document the Supabase setup steps and the required .env values in the README.
4. IF the Supabase URL or anon key is missing at startup, THEN THE TouchGrass_App SHALL display an error message identifying the missing configuration value.

### Requirement 12: Real Persisted Data Only

**User Story:** As a product owner, I want the app to contain only real data, so that it reflects genuine usage from the first day.

#### Acceptance Criteria

1. THE TouchGrass_App SHALL persist all users, Hangouts, Cheers, and Comments in the Database.
2. THE TouchGrass_App SHALL persist all uploaded photos in the Storage_Service.
3. THE TouchGrass_App SHALL start with no seed regular users, no seed Hangouts, and no seed Comments, and SHALL permit only system or administrative accounts required for basic application operation to exist at startup.
4. WHEN the TouchGrass_App displays the Feed, the Leaderboard, or a Profile, THE TouchGrass_App SHALL source the displayed content from the Database and the Storage_Service.
