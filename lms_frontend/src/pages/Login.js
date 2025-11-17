import React, { useState } from 'react';
import { getSupabaseClient } from '../supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Login
 * Simple email magic link login using Supabase Auth.
 * Users enter email; a magic link is sent for verification.
 */
export default function Login() {
  /** This is a public function. Renders login page. */
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      // emailRedirectTo should be site URL; rely on environment variable REACT_APP_FRONTEND_URL if present
      const emailRedirectTo =
        (process.env.REACT_APP_FRONTEND_URL || window.location.origin) + '/';
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo }
      });
      if (error) throw error;
      setStatus({ loading: false, error: '', success: 'Magic link sent. Check your email.' });
    } catch (err) {
      setStatus({ loading: false, error: err.message || 'Login failed', success: '' });
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <p style={{ color: '#6B7280' }}>Enter your email to receive a magic sign-in link.</p>
      <form onSubmit={handleSubmit}>
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          className="input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" disabled={status.loading}>
            {status.loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </div>
        {status.error && <p style={{ color: '#EF4444', marginTop: 12 }}>{status.error}</p>}
        {status.success && <p style={{ color: '#2563EB', marginTop: 12 }}>{status.success}</p>}
      </form>
    </div>
  );
}
