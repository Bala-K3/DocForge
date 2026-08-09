import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Loader2, Download, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { API_BASE } from '../config';

const MergeTool = ({ onBack }) => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null); // { blobUrl, fileName }
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    setFiles([...files, ...pdfFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length < 2) return;

    setStatus('uploading');
    setErrorMessage('');
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await axios.post(`${API_BASE}/api/pdf/merge`, formData, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      setResult({
        blobUrl,
        fileName: `merged_${files[0].name.replace(/\.pdf$/i, '')}_and_more.pdf`
      });
      setStatus('success');
    } catch (error) {
      console.error(error);
      let msg = 'Failed to merge PDF files. Please try again.';
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
        <h2 style={{ marginBottom: '1rem' }}>Merge PDF Files</h2>
        <p style={{ marginBottom: '2rem' }}>Combine multiple PDF files into a single document with 100% in-memory processing.</p>

        {status === 'idle' && (
          <>
            <div 
              className="upload-zone"
              onClick={() => fileInputRef.current.click()}
            >
              <Upload size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>Click to upload or drag and drop</p>
              <p style={{ fontSize: '0.9rem' }}>Only PDF files are supported</p>
              <input 
                type="file" 
                multiple 
                accept="application/pdf" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
            </div>

            <div style={{ marginTop: '2rem' }}>
              <AnimatePresence>
                {files.map((file, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '1rem', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '0.75rem', 
                      marginBottom: '0.5rem' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <File size={20} color="var(--primary)" />
                      <span style={{ fontSize: '0.9rem' }}>{file.name}</span>
                    </div>
                    <X 
                      size={18} 
                      style={{ cursor: 'pointer', color: 'var(--error)' }} 
                      onClick={() => removeFile(index)} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '2rem', height: '3.5rem' }}
              disabled={files.length < 2}
              onClick={handleUpload}
            >
              Merge PDF ({files.length})
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
              <Shield size={14} color="var(--primary)" />
              <span>Zero-Storage: Documents are merged in RAM and never stored on disk.</span>
            </div>
          </>
        )}

        {status === 'uploading' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={64} className="spin" color="var(--primary)" style={{ marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
            <h3>Processing your documents...</h3>
            <p>Merging files directly in memory.</p>
          </div>
        )}

        {status === 'success' && result && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
            <h3>Your PDF is ready!</h3>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>{result.fileName}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a 
                href={result.blobUrl} 
                download={result.fileName}
                className="btn btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={20} /> Download Merged PDF
              </a>
              <button className="btn btn-outline" onClick={handleReset}>
                Process more
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <AlertCircle size={64} color="var(--error)" style={{ marginBottom: '1.5rem' }} />
            <h3>Something went wrong</h3>
            <p style={{ marginBottom: '2rem' }}>{errorMessage || "We couldn't process your request. Please try again."}</p>
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

export default MergeTool;
