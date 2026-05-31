import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Loader2, Download, CheckCircle } from 'lucide-react';

const MergeTool = ({ onBack }) => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [result, setResult] = useState(null);
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
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await axios.post('http://localhost:5000/api/pdf/merge', formData);
      setResult(response.data);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const downloadResult = () => {
    if (!result) return;
    window.open(`http://localhost:5000${result.downloadUrl}`, '_blank');
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
        <p style={{ marginBottom: '2rem' }}>Combine multiple PDF files into a single document.</p>

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
          </>
        )}

        {status === 'uploading' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={64} className="spin" color="var(--primary)" style={{ marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
            <h3>Processing your documents...</h3>
            <p>This may take a few seconds depending on the file size.</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
            <h3>Your PDF is ready!</h3>
            <p style={{ marginBottom: '2rem' }}>{result.fileName}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a 
                href={`http://localhost:5000${result.downloadUrl}`} 
                className="btn btn-primary"
                style={{ textDecoration: 'none' }}
                download
              >
                <Download size={20} /> Download PDF
              </a>
              <button className="btn btn-outline" onClick={() => { setFiles([]); setStatus('idle'); }}>
                Process more
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <X size={64} color="var(--error)" style={{ marginBottom: '1.5rem' }} />
            <h3>Something went wrong</h3>
            <p style={{ marginBottom: '2rem' }}>We couldn't process your request. Please try again.</p>
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
