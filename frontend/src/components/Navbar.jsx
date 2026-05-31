import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import SupportModal from './SupportModal';

const Navbar = () => {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #6366f1, #ec4899)', 
              padding: '8px', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={20} color="white" />
            </div>
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: '800', 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              DocForge
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <a href="/" style={{ 
              color: 'var(--text-main)', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'color 0.2s ease',
              opacity: 0.9
            }}>Tools</a>
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
