import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSupabaseClient } from '../supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Courses
 * Lists courses from Supabase 'courses' table with basic fields: id, title, description
 */
export default function Courses() {
  /** This is a public function. Renders courses listing. */
  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr('');
      if (!supabase) {
        // Preview-friendly fallback when Supabase is not configured
        setCourses([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description')
        .order('id', { ascending: true });
      if (error) {
        setErr(error.message);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    };
    load();
  }, [supabase]);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Courses</h2>
        <Link to="/courses/new" className="btn btn-primary">New Course</Link>
      </div>
      {loading && <p>Loading...</p>}
      {err && <p style={{ color: '#EF4444' }}>{err}</p>}
      {!loading && !err && (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
          {courses.map((c) => (
            <li key={c.id} style={{ padding: '12px 8px', borderBottom: '1px solid #E5E7EB' }}>
              <Link to={`/courses/${c.id}`} style={{ textDecoration: 'none', color: '#2563EB', fontWeight: 600 }}>
                {c.title}
              </Link>
              <div style={{ color: '#6B7280', marginTop: 4 }}>{c.description}</div>
            </li>
          ))}
          {courses.length === 0 && <li>No courses found.</li>}
        </ul>
      )}
    </div>
  );
}
