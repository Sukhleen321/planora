import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--bg-primary)' 
      }}
    >
      <h1 style={{ fontSize: '80px', fontWeight: 900, color: 'var(--accent)' }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Page not found</p>
      <button onClick={() => navigate('/')} className="btn btn-primary">
        Go Home
      </button>
    </div>
  );
}
