-- LMS Row Level Security Policies
-- Enable RLS and define policies for each table.

-- Helper: enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.grades enable row level security;
alter table public.announcements enable row level security;

-- Common predicates
-- Current user's UUID
-- auth.uid() is available in Supabase

-- PROFILES
-- Read own profile; admins can read all (admin comes from profiles.role)
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Update own profile; admins can update all
drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  id = auth.uid()
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- No inserts/deletes by clients (profiles created via trigger); allow admin delete if needed
drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles
for delete
to authenticated
using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- COURSES
-- Select: visible to
-- - instructor who owns
-- - enrolled users
-- - anyone if is_published = true
drop policy if exists "courses_select_visibility" on public.courses;
create policy "courses_select_visibility" on public.courses
for select
to authenticated
using (
  is_published
  or instructor_id = auth.uid()
  or exists(
    select 1 from public.enrollments e
    where e.course_id = courses.id and e.user_id = auth.uid()
  )
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Insert: instructors and admins can create (instructor_id must equal requestor or admin)
drop policy if exists "courses_insert_instructor_or_admin" on public.courses;
create policy "courses_insert_instructor_or_admin" on public.courses
for insert
to authenticated
with check (
  instructor_id = auth.uid()
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('instructor','admin'))
);

-- Update/Delete: owner instructor or admin
drop policy if exists "courses_modify_owner_or_admin" on public.courses;
create policy "courses_modify_owner_or_admin" on public.courses
for all
to authenticated
using (
  instructor_id = auth.uid()
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  instructor_id = auth.uid()
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ENROLLMENTS
-- Select: course owner, enrolled user, admin
drop policy if exists "enrollments_select_related" on public.enrollments;
create policy "enrollments_select_related" on public.enrollments
for select
to authenticated
using (
  user_id = auth.uid()
  or exists(select 1 from public.courses c where c.id = enrollments.course_id and c.instructor_id = auth.uid())
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Insert: instructors (course owner) and admins can enroll users; users can self-enroll for published courses
drop policy if exists "enrollments_insert_owner_admin_self" on public.enrollments;
create policy "enrollments_insert_owner_admin_self" on public.enrollments
for insert
to authenticated
with check (
  -- instructor or admin
  exists(select 1 from public.courses c where c.id = enrollments.course_id and c.instructor_id = auth.uid())
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  -- or self-enroll to published course
  or (user_id = auth.uid() and exists(select 1 from public.courses c where c.id = enrollments.course_id and c.is_published = true))
);

-- Delete: instructor owner, admin, or the user can unenroll self
drop policy if exists "enrollments_delete_owner_admin_self" on public.enrollments;
create policy "enrollments_delete_owner_admin_self" on public.enrollments
for delete
to authenticated
using (
  user_id = auth.uid()
  or exists(select 1 from public.courses c where c.id = enrollments.course_id and c.instructor_id = auth.uid())
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- MODULES
drop policy if exists "modules_select_related" on public.modules;
create policy "modules_select_related" on public.modules
for select
to authenticated
using (
  exists(select 1 from public.courses c where c.id = modules.course_id and (
    c.is_published
    or c.instructor_id = auth.uid()
    or exists(select 1 from public.enrollments e where e.course_id = c.id and e.user_id = auth.uid())
  ))
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "modules_modify_owner_or_admin" on public.modules;
create policy "modules_modify_owner_or_admin" on public.modules
for all
to authenticated
using (
  exists(select 1 from public.courses c where c.id = modules.course_id and (
    c.instructor_id = auth.uid()
  ))
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  exists(select 1 from public.courses c where c.id = modules.course_id and (
    c.instructor_id = auth.uid()
  ))
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- LESSONS
drop policy if exists "lessons_select_related" on public.lessons;
create policy "lessons_select_related" on public.lessons
for select
to authenticated
using (
  exists(
    select 1
    from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = lessons.module_id and (
      c.is_published
      or c.instructor_id = auth.uid()
      or exists(select 1 from public.enrollments e where e.course_id = c.id and e.user_id = auth.uid())
    )
  )
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "lessons_modify_owner_or_admin" on public.lessons;
create policy "lessons_modify_owner_or_admin" on public.lessons
for all
to authenticated
using (
  exists(
    select 1
    from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = lessons.module_id and (
      c.instructor_id = auth.uid()
    )
  )
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  exists(
    select 1
    from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = lessons.module_id and (
      c.instructor_id = auth.uid()
    )
  )
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ASSIGNMENTS
drop policy if exists "assignments_select_related" on public.assignments;
create policy "assignments_select_related" on public.assignments
for select
to authenticated
using (
  exists(select 1 from public.courses c where c.id = assignments.course_id and (
    c.is_published
    or c.instructor_id = auth.uid()
    or exists(select 1 from public.enrollments e where e.course_id = c.id and e.user_id = auth.uid())
  ))
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "assignments_modify_owner_or_admin" on public.assignments;
create policy "assignments_modify_owner_or_admin" on public.assignments
for all
to authenticated
using (
  exists(select 1 from public.courses c where c.id = assignments.course_id and c.instructor_id = auth.uid())
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  exists(select 1 from public.courses c where c.id = assignments.course_id and c.instructor_id = auth.uid())
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- SUBMISSIONS
-- Select: student (owner), course instructor, admin
drop policy if exists "submissions_select_related" on public.submissions;
create policy "submissions_select_related" on public.submissions
for select
to authenticated
using (
  student_id = auth.uid()
  or exists(
    select 1
    from public.assignments a
    join public.courses c on c.id = a.course_id
    where a.id = submissions.assignment_id and c.instructor_id = auth.uid()
  )
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Insert: only student (self) who is enrolled
drop policy if exists "submissions_insert_self_enrolled" on public.submissions;
create policy "submissions_insert_self_enrolled" on public.submissions
for insert
to authenticated
with check (
  student_id = auth.uid()
  and exists(
    select 1
    from public.assignments a
    join public.courses c on c.id = a.course_id
    join public.enrollments e on e.course_id = c.id and e.user_id = auth.uid()
    where a.id = submissions.assignment_id
  )
);

-- Update/Delete: only student owner before graded, or admin; instructors cannot modify student work here
drop policy if exists "submissions_update_owner_before_graded" on public.submissions;
create policy "submissions_update_owner_before_graded" on public.submissions
for update
to authenticated
using (
  student_id = auth.uid()
  and not exists(select 1 from public.grades g where g.submission_id = submissions.id)
)
with check (
  student_id = auth.uid()
  and not exists(select 1 from public.grades g where g.submission_id = submissions.id)
);

drop policy if exists "submissions_delete_owner_before_graded" on public.submissions;
create policy "submissions_delete_owner_before_graded" on public.submissions
for delete
to authenticated
using (
  student_id = auth.uid()
  and not exists(select 1 from public.grades g where g.submission_id = submissions.id)
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- GRADES
-- Select: related student, grader (instructor), admin
drop policy if exists "grades_select_related" on public.grades;
create policy "grades_select_related" on public.grades
for select
to authenticated
using (
  exists(
    select 1
    from public.submissions s
    join public.assignments a on a.id = s.assignment_id
    join public.courses c on c.id = a.course_id
    where s.id = grades.submission_id and (
      s.student_id = auth.uid() or c.instructor_id = auth.uid()
    )
  )
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Insert/Update/Delete: instructor for the course or admin
drop policy if exists "grades_modify_instructor_or_admin" on public.grades;
create policy "grades_modify_instructor_or_admin" on public.grades
for all
to authenticated
using (
  exists(
    select 1
    from public.submissions s
    join public.assignments a on a.id = s.assignment_id
    join public.courses c on c.id = a.course_id
    where s.id = grades.submission_id and c.instructor_id = auth.uid()
  )
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  exists(
    select 1
    from public.submissions s
    join public.assignments a on a.id = s.assignment_id
    join public.courses c on c.id = a.course_id
    where s.id = grades.submission_id and c.instructor_id = auth.uid()
  )
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ANNOUNCEMENTS
-- Select: course audience (published/enrolled/owner/admin)
drop policy if exists "announcements_select_related" on public.announcements;
create policy "announcements_select_related" on public.announcements
for select
to authenticated
using (
  exists(select 1 from public.courses c where c.id = announcements.course_id and (
    c.is_published
    or c.instructor_id = auth.uid()
    or exists(select 1 from public.enrollments e where e.course_id = c.id and e.user_id = auth.uid())
  ))
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Modify: instructor owner or admin
drop policy if exists "announcements_modify_owner_or_admin" on public.announcements;
create policy "announcements_modify_owner_or_admin" on public.announcements
for all
to authenticated
using (
  exists(select 1 from public.courses c where c.id = announcements.course_id and c.instructor_id = auth.uid())
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  exists(select 1 from public.courses c where c.id = announcements.course_id and c.instructor_id = auth.uid())
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
