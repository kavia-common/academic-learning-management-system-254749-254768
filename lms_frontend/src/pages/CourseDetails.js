import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSupabaseClient } from '../supabaseClient';

/**
 * PUBLIC_INTERFACE
 * CourseDetails
 * View and edit a course by id. Supports update and delete.
 */
export default function CourseDetails() {
  /** This is a public function. Renders course details and edit form. */
  const { id } = useParams();
  const supabase = getSupabaseClient();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description')
        .eq('id', id)
        .single();
      if (error) {
        setErr(error.message);
      } else if (data) {
        setForm({ title: data.title || '', description: data.description || '' });
      }
      setLoading(false);
    };
    if (id) load();
  }, [id, supabase]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    const { error } = await supabase
      .from('courses')
      .update({ title: form.title, description: form.description })
      .eq('id', id);
    setSaving(false);
    if (error) setErr(error.message);
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this course?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
      setErr(error.message);
    } else {
      navigate('/courses');
    }
  };

  if (loading) return <div className="card"><p>Loading...</p></div>;
  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h2 style={{ marginTop: 0 }}>Course Details</h2>
      {err && <p style={{ color: '#EF4444' }}>{err}</p>}
      <form onSubmit={onSave} className="grid">
        <div className="col-12">
          <label className="label" htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            className="input"
            value={form.title}
            onChange={onChange}
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
          />
        </div>
        <div className="col-12" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onDelete}>
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
