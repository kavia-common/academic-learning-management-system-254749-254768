import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './components/layout.css';
import Layout from './components/Layout';
import Login from './pages/Login';
import Courses from './pages/Courses';
import CreateCourse from './pages/CreateCourse';
import CourseDetails from './pages/CourseDetails';
import { getSupabaseClient } from './supabaseClient';

/**
 * PUBLIC_INTERFACE
 * App
 * Root app with routing, session management via Supabase, and theme toggle.
 */
function App() {
  /** This is a public function. Main application entry component. */
  const [theme, setTheme] = useState('light');
  const [session, setSession] = useState(null);
  const supabase = (() => {
    try {
      return getSupabaseClient();
    } catch (e) {
      // In case env vars are missing, we still render the UI and show login page,
      // but operations will fail with meaningful error.
      return null;
    }
  })();

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Supabase session listener
  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, [supabase]);

  const onSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const RequireAuth = ({ children }) => {
    if (!session) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Layout user={session?.user} onSignOut={onSignOut}>
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
          <Route
            path="/"
            element={<Navigate to="/courses" replace />}
          />
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
