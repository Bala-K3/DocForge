import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Bug, Coffee, Heart, Send, CheckCircle } from 'lucide-react';

const SupportModal = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, success

  if (!isOpen) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    
    setStatus('sending');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
        onClose();
      }, 2000);
    }, 1000);
  };

  const handleQuickOption = (type) => {
    if (type === 'coffee') {
      window.open('https://buymeacoffee.com/balakgbhbn', '_blank');
      return;
    }
    
    const prefix = type === 'feedback' ? 'Feedback: ' : 'Issue Report: ';
    setMessage(prefix);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.5rem',
            width: '100%',
            maxWidth: '500px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ 
            padding: '1.5rem', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={20} color="var(--secondary)" /> Support DocForge
            </h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: '2rem' }}>
            {status === 'success' ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ textAlign: 'center', padding: '2rem 0' }}
              >
                <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
                <h3>Thank you!</h3>
                <p>Your message has been sent successfully.</p>
              </motion.div>
            ) : (
              <>
                <p style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>
                  DocForge is a free, open-source project. Your feedback helps us make document processing better for everyone.
                </p>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    padding: '1rem', 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onClick={() => handleQuickOption('feedback')}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  >
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px' }}>
                      <MessageSquare size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Send Feedback</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tell us what you think or suggest a feature.</p>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    padding: '1rem', 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onClick={() => handleQuickOption('issue')}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  >
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '12px' }}>
                      <Bug size={20} color="var(--error)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Report an Issue</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Something not working? Let us fix it.</p>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    padding: '1rem', 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onClick={() => handleQuickOption('coffee')}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  >
                    <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '12px' }}>
                      <Coffee size={20} color="#fbbf24" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Buy Me a Coffee</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Support server costs and keep it ad-free.</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '2.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <textarea 
                      placeholder="Your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        color: 'white',
                        fontSize: '0.9rem',
                        minHeight: '100px',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                    <button 
                      onClick={handleSend}
                      disabled={status === 'sending' || !message.trim()}
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: status === 'sending' ? 'var(--text-muted)' : 'var(--primary)',
                        border: 'none',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {status === 'sending' ? 'Sending...' : <><Send size={14} /> Send</>}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SupportModal;
