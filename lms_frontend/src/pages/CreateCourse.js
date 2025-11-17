import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '../supabaseClient';

/**
 * PUBLIC_INTERFACE
 * CreateCourse
 * Simple form to create a new course in 'courses' table.
 */
export default function CreateCourse() {
  /** This is a public function. Renders create course form. */
  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    if (!supabase) {
      setErr('Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
      setSaving(false);
      return;
    }
    const { error, data } = await supabase
      .from('courses')
      .insert([{ title: form.title, description: form.description }])
      .select('id')
      .single();

    setSaving(false);
    if (error) {
      setErr(error.message);
    } else if (data?.id) {
      navigate(`/courses/${data.id}`);
    } else {
      navigate('/courses');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h2 style={{ marginTop: 0 }}>Create Course</h2>
      {!supabase && (
        <p style={{ color: '#EF4444' }}>
          Supabase is not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to enable this feature.
        </p>
      )}
      <form onSubmit={onSubmit} className="grid">
        <div className="col-12">
          <label className="label" htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            className="input"
            value={form.title}
            onChange={onChange}
            placeholder="Intro to Computer Science"
            required
          />
        </div>
        <div className="col-12">
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="input"
            rows={4}
            value={form.description}
            onChange={onChange}
            placeholder="Brief summary of the course"
          />
        </div>
        {err && <p style={{ color: '#EF4444' }}>{err}</p>}
        <div className="col-12" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" disabled={saving || !supabase}>
            {saving ? 'Saving...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
