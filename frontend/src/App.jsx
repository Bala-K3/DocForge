import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MergeTool from './components/MergeTool';
import ConvertTool from './components/ConvertTool';
import TextTool from './components/TextTool';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTool, setActiveTool] = useState(null);

  return (
    <div className="app">
      <Navbar />
      
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="container"
              style={{ padding: '4rem 0', textAlign: 'center' }}
            >
              <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2>Protect PDF</h2>
                <p style={{ margin: '2rem 0' }}>
                  The password protection tool is currently being upgraded for enhanced security. 
                  Check back soon for enterprise-grade encryption features!
                </p>
                <button className="btn btn-primary" onClick={() => setActiveTool(null)}>
                  Back to Tools
                </button>
              </div>
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
