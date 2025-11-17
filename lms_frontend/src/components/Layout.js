import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './layout.css';

export default function Layout({ children, user, onSignOut }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Link to="/" className="brand-link">LMS</Link>
        </div>
        <nav className="nav">
          <NavLink to="/courses" className="nav-item">Courses</NavLink>
          <NavLink to="/courses/new" className="nav-item">Create Course</NavLink>
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Academia</h1>
          </div>
          <div className="topbar-right">
            {user ? (
              <>
                <span className="user-email" title={user.email}>{user.email}</span>
                <button className="btn btn-secondary" onClick={onSignOut}>Sign out</button>
              </>
            ) : (
              <Link className="btn btn-primary" to="/login">Login</Link>
            )}
          </div>
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}
