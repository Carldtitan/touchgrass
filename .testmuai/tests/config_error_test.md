---
mode: testing
max_steps: 12
target: chrome
---

# Config Error Startup Test

Verifies Requirement 11.4: when Supabase configuration is missing, the app shows a
configuration error screen that names the missing variables instead of a blank page.

## Step 1
Go to http://localhost:3000

## Step 2
Verify the page shows a heading with the text "Configuration error" and lists the missing configuration values "VITE_SUPABASE_URL" and "VITE_SUPABASE_ANON_KEY".
