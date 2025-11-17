-- Sample seed data for LMS (optional). Run after schema and policies.
-- Notes:
-- - Replace the UUIDs below with real auth.users IDs if you want them linked to actual accounts.

-- Create two fake users directly in profiles (helpful for local DB testing).
-- In Supabase, profiles are auto-created from auth.users; here we seed standalone for demo.
-- Use random UUIDs for demonstration (not linked to auth).
with
  instructor as (
    insert into public.profiles (id, email, full_name, role)
    values (gen_random_uuid(), 'instructor@example.com', 'Ivy Instructor', 'instructor')
    returning id
  ),
  student as (
    insert into public.profiles (id, email, full_name, role)
    values (gen_random_uuid(), 'student@example.com', 'Sam Student', 'student')
    returning id
  )
insert into public.courses (title, description, instructor_id, is_published)
select
  'Intro to Computer Science',
  'Foundational concepts in CS including algorithms and data structures.',
  i.id,
  true
from instructor i;

-- Module and lesson
with c as (
  select id from public.courses where title = 'Intro to Computer Science' limit 1
)
insert into public.modules (course_id, title, position)
select c.id, 'Module 1: Basics', 1 from c;

with m as (
  select id, course_id from public.modules where title = 'Module 1: Basics' limit 1
)
insert into public.lessons (module_id, title, content, position)
select m.id, 'Lesson 1: Algorithms', 'What is an algorithm? Basics and examples.', 1 from m;

-- Assignment
with c as (
  select id from public.courses where title = 'Intro to Computer Science' limit 1
)
insert into public.assignments (course_id, title, description, due_at)
select c.id, 'Homework 1', 'Solve basic algorithm problems.', now() + interval '7 days' from c;

-- Enrollment: enroll the student
with
  s as (select id from public.profiles where email = 'student@example.com' limit 1),
  c as (select id from public.courses where title = 'Intro to Computer Science' limit 1)
insert into public.enrollments (course_id, user_id, role)
select c.id, s.id, 'student' from c, s
on conflict do nothing;

-- Submission (optional): a draft by the student
with
  s as (select id from public.profiles where email = 'student@example.com' limit 1),
  a as (select id from public.assignments where title = 'Homework 1' limit 1)
insert into public.submissions (assignment_id, student_id, content)
select a.id, s.id, 'My homework answers...' from a, s
on conflict do nothing;

-- Grade (optional): grader is the instructor
with
  sub as (select id from public.submissions limit 1),
  i as (select id from public.profiles where email = 'instructor@example.com' limit 1)
insert into public.grades (submission_id, grader_id, score, feedback)
select sub.id, i.id, 95.0, 'Great job!' from sub, i
on conflict do nothing;

-- Announcement
with
  c as (select id from public.courses where title = 'Intro to Computer Science' limit 1),
  i as (select id from public.profiles where email = 'instructor@example.com' limit 1)
insert into public.announcements (course_id, author_id, title, message)
select c.id, i.id, 'Welcome!', 'Welcome to the course. Please read the syllabus.' from c, i
on conflict do nothing;

-- Verify counts
select
  (select count(*) from public.profiles) as profiles_count,
  (select count(*) from public.courses) as courses_count,
  (select count(*) from public.enrollments) as enrollments_count,
  (select count(*) from public.modules) as modules_count,
  (select count(*) from public.lessons) as lessons_count,
  (select count(*) from public.assignments) as assignments_count,
  (select count(*) from public.submissions) as submissions_count,
  (select count(*) from public.grades) as grades_count,
  (select count(*) from public.announcements) as announcements_count;
