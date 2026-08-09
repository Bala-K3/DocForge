import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  Shield, 
  ShieldCheck, 
  Loader2, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Settings2
} from 'lucide-react';
import { API_BASE } from '../config';

const ProtectTool = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState('');
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(true);
  const [allowModifying, setAllowModifying] = useState(false);

  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setErrorMessage('');
    } else if (selectedFile) {
      setErrorMessage('Please select a valid PDF file (.pdf).');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { score: 66, label: 'Medium', color: '#f59e0b' };
    return { score: 100, label: 'Strong', color: '#10b981' };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;

  const handleProtect = async () => {
    if (!file) {
      setErrorMessage('Please upload a PDF file first.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    if (ownerPassword) formData.append('ownerPassword', ownerPassword);
    formData.append('allowPrinting', allowPrinting);
    formData.append('allowCopying', allowCopying);
    formData.append('allowModifying', allowModifying);

    try {
      const response = await axios.post(`${API_BASE}/api/pdf/protect`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const safeName = file.name.replace(/\.pdf$/i, '') + '_protected.pdf';

      setResult({
        blobUrl,
        fileName: safeName
      });
      setStatus('success');
    } catch (error) {
      console.error(error);
      let msg = 'Failed to protect PDF. The document might already be encrypted or corrupted.';
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
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setOwnerPassword('');
    setAllowPrinting(true);
    setAllowCopying(true);
    setAllowModifying(false);
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '820px' }}>
      <button 
        onClick={onBack}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-muted)', 
          cursor: 'pointer', 
          marginBottom: '2rem', 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontSize: '0.95rem',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <X size={18} /> Back to Tools
      </button>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ 
            padding: '10px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.15))',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Lock size={28} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.85rem' }}>Protect PDF</h2>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              Encrypt your PDF documents with industry-grade AES-256 password protection.
            </p>
          </div>
        </div>

        {status === 'idle' && (
          <div style={{ marginTop: '2rem' }}>
            {/* Upload Area */}
            {!file ? (
              <div 
                className="upload-zone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                style={{
                  border: isDragging ? '2px dashed var(--accent)' : '2px dashed rgba(255, 255, 255, 0.15)',
                  backgroundColor: isDragging ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  padding: '3rem 2rem',
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}>
                  <Upload size={32} color="var(--accent)" />
                </div>
                <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                  Click to upload or drag & drop PDF
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                  Supports all standard PDF documents (.pdf)
                </p>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1.25rem', 
                background: 'rgba(255,255,255,0.04)', 
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.85rem', 
                marginBottom: '2rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                  <div style={{ 
                    padding: '10px', 
                    borderRadius: '10px', 
                    background: 'rgba(56, 189, 248, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={24} color="var(--accent)" />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '1rem', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      color: 'var(--text-main)'
                    }}>
                      {file.name}
                    </h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  title="Remove file"
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: 'var(--error)', 
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}
                >
                  <X size={16} /> Remove
                </button>
              </div>
            )}

            {/* Password Form */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: 'var(--text-main)' 
                }}>
                  Set Password <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password to encrypt PDF"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 3rem 0.85rem 1rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '0.75rem',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Strength</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: strength.color }}>{strength.label}</span>
                    </div>
                    <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${strength.score}%`, 
                          background: strength.color,
                          transition: 'all 0.3s ease'
                        }} 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: 'var(--text-main)' 
                }}>
                  Confirm Password <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 3rem 0.85rem 1rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: confirmPassword && !passwordsMatch ? '1px solid var(--error)' : '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '0.75rem',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    Passwords do not match.
                  </p>
                )}
                {confirmPassword && passwordsMatch && (
                  <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} /> Passwords match
                  </p>
                )}
              </div>

              {/* Advanced Options Toggle */}
              <div style={{ marginTop: '0.5rem' }}>
                <button 
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: 0
                  }}
                >
                  <Settings2 size={16} />
                  <span>Advanced Permissions & Settings</span>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ 
                        overflow: 'hidden', 
                        marginTop: '1rem',
                        padding: '1.25rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}
                    >
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                          Owner / Master Password (Optional)
                        </label>
                        <input 
                          type="password"
                          placeholder="Optional separate owner password"
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                          <input 
                            type="checkbox" 
                            checked={allowPrinting} 
                            onChange={(e) => setAllowPrinting(e.target.checked)}
                            style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                          />
                          Allow document printing
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                          <input 
                            type="checkbox" 
                            checked={allowCopying} 
                            onChange={(e) => setAllowCopying(e.target.checked)}
                            style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                          />
                          Allow copying text and graphics
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                          <input 
                            type="checkbox" 
                            checked={allowModifying} 
                            onChange={(e) => setAllowModifying(e.target.checked)}
                            style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                          />
                          Allow modifying or editing document
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#fca5a5',
                  fontSize: '0.875rem'
                }}>
                  <AlertCircle size={16} color="var(--error)" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button 
                className="btn btn-primary"
                onClick={handleProtect}
                disabled={!file || !password || !confirmPassword || !passwordsMatch}
                style={{
                  width: '100%',
                  marginTop: '1.5rem',
                  height: '3.5rem',
                  background: (!file || !password || !confirmPassword || !passwordsMatch)
                    ? 'rgba(255,255,255,0.1)'
                    : 'linear-gradient(135deg, #0284c7, #6366f1)',
                  color: 'white',
                  cursor: (!file || !password || !confirmPassword || !passwordsMatch) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '700',
                  boxShadow: (!file || !password || !confirmPassword || !passwordsMatch)
                    ? 'none'
                    : '0 8px 24px rgba(2, 132, 199, 0.3)'
                }}
              >
                <Lock size={18} /> Protect PDF with AES-256
              </button>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                color: 'var(--text-muted)', 
                fontSize: '0.8rem',
                marginTop: '0.25rem' 
              }}>
                <Shield size={14} color="var(--accent)" />
                <span>Zero-knowledge client-server processing. Files are removed immediately after download.</span>
              </div>
            </div>
          </div>
        )}

        {status === 'uploading' && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
              <Loader2 size={64} color="var(--accent)" style={{ animation: 'spin 2s linear infinite' }} />
              <Shield size={24} color="var(--accent)" style={{ position: 'absolute', top: '20px', left: '20px' }} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Securing your PDF...</h3>
            <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem' }}>
              Applying military-grade AES-256 encryption and setting up document security.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <ShieldCheck size={40} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your PDF is Protected!</h3>
            <p style={{ marginBottom: '1.75rem', color: 'var(--text-muted)' }}>
              {result?.fileName || 'Encrypted document ready for download.'}
            </p>

            <div style={{ 
              maxWidth: '460px', 
              margin: '0 auto 2rem', 
              padding: '1rem', 
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '0.75rem',
              textAlign: 'left',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <Key size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <strong>Important:</strong> Keep your password safe. Without the password, the encrypted contents cannot be unlocked.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a 
                href={result.blobUrl} 
                download={result.fileName}
                className="btn btn-primary"
                style={{ 
                  background: 'linear-gradient(135deg, #0284c7, #6366f1)', 
                  textDecoration: 'none',
                  padding: '0.85rem 2rem',
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Download size={20} /> Download Protected PDF
              </a>
              <button 
                className="btn btn-outline" 
                onClick={handleReset}
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-main)' }}
              >
                Protect Another PDF
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <AlertCircle size={40} color="var(--error)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Protection Failed</h3>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 2rem' }}>
              {errorMessage || "We couldn't protect your document. Please verify the PDF is not already encrypted."}
            </p>
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

export default ProtectTool;
