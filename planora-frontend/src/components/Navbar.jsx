import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <span className="logo" onClick={() => { navigate('/'); setMobileOpen(false); }} style={{ cursor: 'pointer' }}>
          ✈️ Planora
        </span>
        <div className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
          {isAuthenticated ? (
            <>
              <span onClick={() => { navigate('/dashboard'); setMobileOpen(false); }} className="nav-link" style={{ cursor: 'pointer' }}>
                Dashboard
              </span>
              <button onClick={() => { navigate('/generate'); setMobileOpen(false); }} className="btn btn-primary btn-sm-nav">
                Generate Trip
              </button>
              <button onClick={handleLogout} className="nav-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <span onClick={() => { navigate('/login'); setMobileOpen(false); }} className="nav-link" style={{ cursor: 'pointer' }}>
                Login
              </span>
              <button onClick={() => { navigate('/signup'); setMobileOpen(false); }} className="btn btn-primary btn-sm-nav">
                Sign Up
              </button>
            </>
          )}
        </div>
        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
      </div>
    </nav>
  );
}
