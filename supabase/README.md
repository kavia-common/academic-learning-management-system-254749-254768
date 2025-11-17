# Supabase SQL Artifacts for LMS

This folder contains SQL scripts to set up the database schema, row-level security (RLS) policies, triggers, and optional seed data for the LMS.

Contents:
- schema.sql — Tables, relationships, triggers (updated_at, auto-create profile on auth.users insert)
- policies.sql — RLS policies for each table (profiles, courses, enrollments, modules, lessons, assignments, submissions, grades, announcements)
- seed.sql — Optional sample data to help you get started

Prerequisites:
- A Supabase project
- Anon and service keys available (used by the frontend; do not hardcode here)
- Supabase SQL Editor or Supabase CLI

Recommended execution order:
1) schema.sql
2) policies.sql
3) seed.sql (optional)

Apply via Supabase Dashboard (SQL Editor):
1. Open your Supabase project
2. Navigate to SQL → New query
3. Paste the contents of schema.sql and run
4. Paste the contents of policies.sql and run
5. (Optional) Paste the contents of seed.sql and run

Apply via Supabase CLI:
- Install the CLI: https://supabase.com/docs/reference/cli
- Authenticate and link your project: supabase login and supabase link
- From the repository root:

  supabase db execute --file ./academic-learning-management-system-254749-254768/supabase/schema.sql
  supabase db execute --file ./academic-learning-management-system-254749-254768/supabase/policies.sql
  supabase db execute --file ./academic-learning-management-system-254749-254768/supabase/seed.sql

Notes on Auth and Profiles:
- profiles are auto-created from auth.users by the trigger defined in schema.sql (handle_new_user).
- If you use the seed data, it inserts demo profiles with random UUIDs not linked to auth.users. For real users, create accounts via Supabase Auth; the trigger will maintain profiles.

Frontend environment variables (React):
- Ensure you set the following in your .env configuration for the lms_frontend app:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_ANON_KEY
  - REACT_APP_FRONTEND_URL (used for login magic link redirect)
- The container also supports these (optional) environment variables described in the project’s configuration:
  - REACT_APP_API_BASE, REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED

Security and RLS Summary:
- Students can read published courses and courses they are enrolled in; they can submit their own assignments and view their own grades.
- Instructors (course owners) can manage their courses, content, assignments, grades, and enrollments for their courses.
- Admins (profiles.role = 'admin') have broad access for management and support operations.

Troubleshooting:
- If you see permission denied errors, ensure you executed policies.sql and that your logged-in user has a profile with the correct role.
- If profiles appear missing for new users, confirm the handle_new_user trigger exists on auth.users and that the function is in the public schema.

License:
- Provided as-is for project setup convenience.
