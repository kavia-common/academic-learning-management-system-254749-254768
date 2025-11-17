import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './layout.css';

export default function Layout({ children, user, onSignOut, backendHealthy = true, healthChecked = false }) {
  const showHealthBanner = healthChecked && !backendHealthy;
  return (
    <div className="app-shell">
      {showHealthBanner && (
        <div style={{position:'fixed', top:0, left:0, right:0, zIndex:1000, background:'#FEF2F2', color:'#991B1B', borderBottom:'1px solid #FCA5A5', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span><strong>Backend Unavailable:</strong> Healthcheck failed. Privileged actions may not work.</span>
          <button className="btn btn-secondary" onClick={(e)=>{e.currentTarget.parentElement.style.display='none';}}>Dismiss</button>
        </div>
      )}
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
