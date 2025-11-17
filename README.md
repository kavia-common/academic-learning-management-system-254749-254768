# academic-learning-management-system-254749-254768

## Supabase Database Setup

SQL artifacts to create the LMS schema, RLS policies, triggers, and optional seed data are available in:
- academic-learning-management-system-254749-254768/supabase/

Apply them in this order:
1. schema.sql
2. policies.sql
3. seed.sql (optional)

You can run these via the Supabase Dashboard (SQL Editor) or the Supabase CLI. See the README in the supabase/ directory for detailed instructions.

Frontend requires the following environment variables:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- REACT_APP_FRONTEND_URL (used for Supabase emailRedirectTo)

Ensure these are set in your environment for the lms_frontend React app.