import React from 'react';

export default function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <div 
        style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #232B42', 
          borderTop: '3px solid #3B82F6', 
          borderRadius: '50%', 
          animation: 'spin 0.8s linear infinite' 
        }} 
      />
    </div>
  );
}
