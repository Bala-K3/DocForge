import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2, Download, CheckCircle } from 'lucide-react';
import { API_BASE } from '../config';

const ConvertTool = ({ onBack }) => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    setFiles([...files, ...imageFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setStatus('uploading');
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const response = await axios.post(`${API_BASE}/api/pdf/image-to-pdf`, formData);
      setResult(response.data);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const downloadResult = () => {
    if (!result) return;
    window.open(`${API_BASE}${result.downloadUrl}`, '_blank');
  };

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <button 
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <X size={18} /> Back to Tools
      </button>

      <div className="glass-card">
        <h2 style={{ marginBottom: '1rem' }}>Image to PDF</h2>
        <p style={{ marginBottom: '2rem' }}>Convert your JPG, PNG, and other images to a single PDF document.</p>

        {status === 'idle' && (
          <>
            <div 
              className="upload-zone"
              onClick={() => fileInputRef.current.click()}
            >
              <Upload size={48} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
              <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>Click to upload images</p>
              <p style={{ fontSize: '0.9rem' }}>JPG, PNG, WebP supported</p>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
            </div>

            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
              <AnimatePresence>
                {files.map((file, index) => (
                  <motion.div 
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    style={{ 
                      position: 'relative',
                      aspectRatio: '1',
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '0.75rem', 
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div 
                      onClick={() => removeFile(index)}
                      style={{ 
                        position: 'absolute', 
                        top: '4px', 
                        right: '4px', 
                        background: 'rgba(0,0,0,0.5)', 
                        borderRadius: '50%', 
                        padding: '2px', 
                        cursor: 'pointer' 
                      }}
                    >
                      <X size={14} color="white" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '2rem', height: '3.5rem', background: 'linear-gradient(135deg, var(--secondary), #f43f5e)' }}
              disabled={files.length === 0}
              onClick={handleUpload}
            >
              Convert to PDF ({files.length})
            </button>
          </>
        )}

        {status === 'uploading' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={64} color="var(--secondary)" style={{ marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
            <h3>Creating your PDF...</h3>
            <p>Optimizing images and generating document.</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
            <h3>Conversion Complete!</h3>
            <p style={{ marginBottom: '2rem' }}>{result.fileName}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a 
                href={`${API_BASE}${result.downloadUrl}`} 
                className="btn btn-primary" 
                style={{ background: 'linear-gradient(135deg, var(--secondary), #f43f5e)', textDecoration: 'none' }}
                download
              >
                <Download size={20} /> Download PDF
              </a>
              <button className="btn btn-outline" onClick={() => { setFiles([]); setStatus('idle'); }}>
                Convert more
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <X size={64} color="var(--error)" style={{ marginBottom: '1.5rem' }} />
            <h3>Conversion failed</h3>
            <p style={{ marginBottom: '2rem' }}>Please ensure your images are valid formats.</p>
            <button className="btn btn-primary" onClick={() => setStatus('idle')}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConvertTool;
