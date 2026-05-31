import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Upload, X, FileText, Loader2, Download, CheckCircle } from 'lucide-react';
import { API_BASE } from '../config';

const TextTool = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/plain') {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/api/pdf/text-to-pdf`, formData);
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
        <h2 style={{ marginBottom: '1rem' }}>Text to PDF</h2>
        <p style={{ marginBottom: '2rem' }}>Convert your .txt files into clean PDF documents.</p>

        {status === 'idle' && (
          <>
            {!file ? (
              <div 
                className="upload-zone"
                onClick={() => fileInputRef.current.click()}
              >
                <FileText size={48} color="#fbbf24" style={{ marginBottom: '1rem' }} />
                <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>Click to upload a text file</p>
                <p style={{ fontSize: '0.9rem' }}>Only .txt supported</p>
                <input 
                  type="file" 
                  accept=".txt" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
              </div>
            ) : (
              <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', textAlign: 'center' }}>
                <FileText size={48} color="#fbbf24" style={{ marginBottom: '1rem' }} />
                <h3>{file.name}</h3>
                <p>{(file.size / 1024).toFixed(2)} KB</p>
                <button 
                  className="btn btn-outline" 
                  style={{ marginTop: '1.5rem' }}
                  onClick={() => setFile(null)}
                >
                  Remove File
                </button>
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '2rem', height: '3.5rem', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
              disabled={!file}
              onClick={handleUpload}
            >
              Convert to PDF
            </button>
          </>
        )}

        {status === 'uploading' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={64} color="#fbbf24" style={{ marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
            <h3>Converting to PDF...</h3>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
            <h3>Text Converted!</h3>
            <p style={{ marginBottom: '2rem' }}>{result.fileName}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a 
                href={`${API_BASE}${result.downloadUrl}`} 
                className="btn btn-primary" 
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', textDecoration: 'none' }}
                download
              >
                <Download size={20} /> Download PDF
              </a>
              <button className="btn btn-outline" onClick={() => { setFile(null); setStatus('idle'); }}>
                Convert more
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <X size={64} color="var(--error)" style={{ marginBottom: '1.5rem' }} />
            <h3>Something went wrong</h3>
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

export default TextTool;
