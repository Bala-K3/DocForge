import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2, Download, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { API_BASE } from '../config';

const ConvertTool = ({ onBack }) => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
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
    setErrorMessage('');
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const response = await axios.post(`${API_BASE}/api/pdf/image-to-pdf`, formData, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      setResult({
        blobUrl,
        fileName: `converted_${files.length}_images.pdf`
      });
      setStatus('success');
    } catch (error) {
      console.error(error);
      let msg = 'Conversion failed. Please ensure your images are valid formats.';
      if (error.response && error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          if (json.message) msg = json.message;
        } catch {}
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      }
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
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
        <p style={{ marginBottom: '2rem' }}>Convert your JPG, PNG, and WebP images to a single PDF document in-memory.</p>

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

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              color: 'var(--text-muted)', 
              fontSize: '0.8rem',
              marginTop: '1rem' 
            }}>
              <Shield size={14} color="var(--secondary)" />
              <span>Zero-Storage: Images are transformed entirely in memory.</span>
            </div>
          </>
        )}

        {status === 'uploading' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={64} color="var(--secondary)" style={{ marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
            <h3>Creating your PDF...</h3>
            <p>Optimizing images and generating document in memory.</p>
          </div>
        )}

        {status === 'success' && result && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
            <h3>Conversion Complete!</h3>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>{result.fileName}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a 
                href={result.blobUrl} 
                download={result.fileName}
                className="btn btn-primary" 
                style={{ background: 'linear-gradient(135deg, var(--secondary), #f43f5e)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={20} /> Download PDF
              </a>
              <button className="btn btn-outline" onClick={handleReset}>
                Convert more
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <AlertCircle size={64} color="var(--error)" style={{ marginBottom: '1.5rem' }} />
            <h3>Conversion failed</h3>
            <p style={{ marginBottom: '2rem' }}>{errorMessage || 'Please ensure your images are valid formats.'}</p>
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
