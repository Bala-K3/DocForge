import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Image as ImageIcon, Lock, ArrowRight, Zap, Shield, RefreshCcw, FileCode } from 'lucide-react';

const tools = [
  {
    id: 'merge',
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one professional document in seconds.',
    icon: <Layers size={32} color="#6366f1" />,
    color: 'var(--primary)',
    badge: 'Popular'
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Convert JPG, PNG, and more into high-quality PDF files instantly.',
    icon: <ImageIcon size={32} color="#ec4899" />,
    color: 'var(--secondary)',
    badge: 'Fast'
  },
  {
    id: 'text-to-pdf',
    title: 'Text to PDF',
    description: 'Convert plain text or markdown files into clean, readable PDF documents.',
    icon: <FileCode size={32} color="#fbbf24" />,
    color: '#fbbf24',
    badge: 'New'
  },
  {
    id: 'protect',
    title: 'Protect PDF',
    description: 'Encrypt your documents with military-grade password protection.',
    icon: <Lock size={32} color="#38bdf8" />,
    color: 'var(--accent)',
    badge: 'Secure'
  }
];

const Home = ({ onSelectTool }) => {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <header style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center',
            gap: '0.65rem',
            padding: '6px 18px', 
            borderRadius: '24px', 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))', 
            color: '#f8fafc',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '2rem',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(8px)'
          }}>
            <img src="/logo.svg" alt="DocForge" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
            <span>Powerful Document Processing</span>
          </div>
          <h1>The Ultimate PDF Toolset</h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '3rem' }}>
            DocForge provides professional-grade PDF utilities with a focus on speed, 
            security, and beautiful design. No registration required.
          </p>
        </motion.div>
      </header>

      <div className="tool-grid">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card"
            style={{ cursor: 'pointer', position: 'relative' }}
            onClick={() => onSelectTool(tool.id)}
          >
            {tool.badge && (
              <span style={{ 
                position: 'absolute', 
                top: '1.5rem', 
                right: '1.5rem', 
                fontSize: '0.75rem', 
                background: tool.color, 
                color: 'white', 
                padding: '2px 10px', 
                borderRadius: '12px',
                fontWeight: '700'
              }}>
                {tool.badge}
              </span>
            )}
            <div style={{ marginBottom: '1.5rem' }}>{tool.icon}</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{tool.title}</h3>
            <p style={{ marginBottom: '2rem' }}>{tool.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: tool.color, fontWeight: '600' }}>
              Launch Tool <ArrowRight size={18} />
            </div>
          </motion.div>
        ))}
      </div>

      <section style={{ marginTop: '8rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '4rem' }}>Why professionals choose DocForge</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
          <div>
            <div style={{ marginBottom: '1rem' }}><Zap color="var(--primary)" size={32} /></div>
            <h4>Instant Processing</h4>
            <p style={{ fontSize: '1rem' }}>Zero wait time. Our high-performance engine handles documents in milliseconds.</p>
          </div>
          <div>
            <div style={{ marginBottom: '1rem' }}><Shield color="var(--secondary)" size={32} /></div>
            <h4>Secure & Private</h4>
            <p style={{ fontSize: '1rem' }}>Files are processed locally and deleted immediately after download.</p>
          </div>
          <div>
            <div style={{ marginBottom: '1rem' }}><RefreshCcw color="var(--accent)" size={32} /></div>
            <h4>Always Free</h4>
            <p style={{ fontSize: '1rem' }}>Access all core features without any subscription or hidden costs.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
