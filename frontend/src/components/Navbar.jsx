import React, { useState } from 'react';
import SupportModal from './SupportModal';

const Navbar = ({ onHome }) => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <>
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <nav style={{ 
        position: 'sticky',
        top: '1rem',
        zIndex: 100,
        margin: '0 auto',
        maxWidth: '1200px',
        padding: '0 2rem'
      }}>
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '1.25rem',
          padding: '0.75rem 2rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
        }}>
          <div 
            onClick={onHome}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              cursor: onHome ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.25)'
            }}>
              <img 
                src="/logo.svg" 
                alt="DocForge Logo" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  display: 'block'
                }} 
              />
            </div>
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: '800', 
              letterSpacing: '-0.5px',
              color: '#ffffff'
            }}>
              DocForge
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <button 
              onClick={onHome}
              style={{ 
                background: 'none',
                border: 'none',
                color: 'var(--text-main)', 
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'color 0.2s ease',
                opacity: 0.9,
                cursor: onHome ? 'pointer' : 'default',
                padding: 0
              }}
            >
              Tools
            </button>
            <div style={{ 
              height: '20px', 
              width: '1px', 
              background: 'rgba(255,255,255,0.1)' 
            }}></div>
            <button 
              onClick={() => setIsSupportOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.05)';
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              Support
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
