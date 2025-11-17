import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import './components/layout.css';
import Layout from './components/Layout';
import Login from './pages/Login';
import Courses from './pages/Courses';
import CreateCourse from './pages/CreateCourse';
import CourseDetails from './pages/CourseDetails';
import { getSupabaseClient } from './supabaseClient';
import { backendHealthcheck, getSessionToken } from './services/api';

/**
 * PUBLIC_INTERFACE
 * App
 * Root app with routing, session management via Supabase, and theme toggle.
 */
function App() {
  /** This is a public function. Main application entry component. */
  const [theme, setTheme] = useState('light');
  const [session, setSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(true);
  const [healthChecked, setHealthChecked] = useState(false);

  // Build supabase client if env present; otherwise null (preview-friendly)
  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch (e) {
      console.warn('Supabase not configured:', e?.message || e);
      return null;
    }
  }, []);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Backend healthcheck banner
  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await backendHealthcheck();
      if (mounted) {
        setBackendHealthy(res.ok);
        setHealthChecked(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Expose token getter for optional consumers
  useEffect(() => {
    window.__getSupabaseSessionToken = async () => await getSessionToken().catch(() => null);
  }, []);

  // Supabase session listener
  useEffect(() => {
    let unsub = null;
    let mounted = true;

    const init = async () => {
      if (!supabase) {
        // No supabase configured; consider session checked but null
        setSession(null);
        setSessionChecked(true);
        return;
      }
      try {
        const { data, error } = await supabase.auth.getSession();
        if (mounted) {
          if (!error) setSession(data?.session || null);
          setSessionChecked(true);
        }
      } catch {
        if (mounted) setSessionChecked(true);
      }
      const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });
      unsub = sub?.subscription;
    };

    init();

    return () => {
      mounted = false;
      try {
        unsub?.unsubscribe?.();
      } catch {
        // ignore
      }
    };
  }, [supabase]);

  const onSignOut = async () => {
    if (!supabase) {
      // No-op if supabase is not configured
      return;
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore signout errors in preview
    }
  };

  // Auth gate with safe waiting until session is checked to avoid premature redirects
  const RequireAuth = ({ children }) => {
    const location = useLocation();
    if (!sessionChecked) {
      return <div className="card"><p>Loading...</p></div>;
    }
    if (!session) {
      // Allow login route even when unauthenticated
      if (location.pathname === '/login') {
        return children;
      }
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Layout user={session?.user || null} onSignOut={onSignOut} backendHealthy={backendHealthy} healthChecked={healthChecked}>
        <button
          className="btn btn-secondary"
          onClick={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
          style={{ position: 'absolute', top: 16, right: 16 }}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route
            path="/courses"
            element={
              <RequireAuth>
                <Courses />
              </RequireAuth>
            }
          />
          <Route
            path="/courses/new"
            element={
              <RequireAuth>
                <CreateCourse />
              </RequireAuth>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <RequireAuth>
                <CourseDetails />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
