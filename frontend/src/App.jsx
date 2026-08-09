import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MergeTool from './components/MergeTool';
import ConvertTool from './components/ConvertTool';
import TextTool from './components/TextTool';
import ProtectTool from './components/ProtectTool';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTool, setActiveTool] = useState(null);

  return (
    <div className="app">
      <Navbar onHome={() => setActiveTool(null)} />
      
      <main>
        <AnimatePresence mode="wait">
          {!activeTool && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Home onSelectTool={setActiveTool} />
            </motion.div>
          )}

          {activeTool === 'merge' && (
            <motion.div
              key="merge"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <MergeTool onBack={() => setActiveTool(null)} />
            </motion.div>
          )}

          {activeTool === 'image-to-pdf' && (
            <motion.div
              key="convert"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <ConvertTool onBack={() => setActiveTool(null)} />
            </motion.div>
          )}

          {activeTool === 'text-to-pdf' && (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <TextTool onBack={() => setActiveTool(null)} />
            </motion.div>
          )}

          {activeTool === 'protect' && (
            <motion.div
              key="protect"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <ProtectTool onBack={() => setActiveTool(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ 
        padding: '4rem 0', 
        textAlign: 'center', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginTop: '4rem'
      }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.6rem', 
            marginBottom: '0.75rem',
            cursor: 'pointer' 
          }}
          onClick={() => setActiveTool(null)}
          >
            <img src="/logo.svg" alt="DocForge Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>DocForge</span>
          </div>
          <p>© 2026 DocForge. Built with passion for better documents.</p>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
