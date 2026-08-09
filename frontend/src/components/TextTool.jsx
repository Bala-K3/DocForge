import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  FileText, 
  Loader2, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  Sliders, 
  Sparkles,
  RotateCcw,
  Eye
} from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Text sanitizer for PDF standard fonts (WinAnsi encoding)
function sanitizeTextForPDF(input) {
  if (!input) return '';
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '    ') // 4 spaces for tabs
    .replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000]/g, ' ') // unicode spaces
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // smart double quotes
    .replace(/[\u2013\u2014\u2212]/g, '-') // dashes
    .replace(/\u2026/g, '...') // ellipsis
    .replace(/[\u2022\u25E6\u25AA\u25AB]/g, '* ') // bullets
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '?'); // replace unencodable characters
}

const TextTool = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'type'
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [fontSize, setFontSize] = useState('11');
  const [pageSize, setPageSize] = useState('A4');
  const [showPageNumbers, setShowPageNumbers] = useState(true);

  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null); // { downloadUrl, fileName, blobUrl }
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMessage('');

    // Auto-extract title from file name
    if (!documentTitle) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setDocumentTitle(cleanName);
    }

    // Read text for preview and conversion
    const reader = new FileReader();
    reader.onload = (e) => {
      setTextContent(e.target.result || '');
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file.');
    };
    reader.readAsText(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // High-performance client-side PDF generation
  const generatePDFClientSide = async (rawText, titleName) => {
    const cleanText = sanitizeTextForPDF(rawText);
    const cleanTitle = sanitizeTextForPDF(documentTitle);
    const numFontSize = Math.max(8, Math.min(24, parseInt(fontSize, 10) || 11));
    const lineHeight = numFontSize * 1.5;
    const margin = 50;

    // Page dimensions
    let pageWidth = 595.28; // A4
    let pageHeight = 841.89;
    if (pageSize === 'Letter') {
      pageWidth = 612;
      pageHeight = 792;
    }

    const maxContentWidth = Math.max(100, pageWidth - (margin * 2));
    const pdfDoc = await PDFDocument.create();

    // Font selection
    let selectedFont = StandardFonts.Helvetica;
    let selectedBoldFont = StandardFonts.HelveticaBold;
    if (fontFamily === 'Times') {
      selectedFont = StandardFonts.TimesRoman;
      selectedBoldFont = StandardFonts.TimesRomanBold;
    } else if (fontFamily === 'Courier') {
      selectedFont = StandardFonts.Courier;
      selectedBoldFont = StandardFonts.CourierBold;
    }

    const font = await pdfDoc.embedFont(selectedFont);
    const boldFont = await pdfDoc.embedFont(selectedBoldFont);

    const paragraphs = cleanText.split('\n');
    const linesToDraw = [];

    // Title header
    if (cleanTitle && cleanTitle.trim()) {
      linesToDraw.push({ text: cleanTitle.trim(), isTitle: true, size: numFontSize + 6, font: boldFont });
      linesToDraw.push({ text: '', isSpacer: true });
    }

    for (const para of paragraphs) {
      if (para.trim() === '') {
        linesToDraw.push({ text: '', isSpacer: true });
        continue;
      }

      const words = para.split(' ');
      let currentLine = '';

      for (const word of words) {
        let wordWidth = 0;
        try {
          wordWidth = font.widthOfTextAtSize(word, numFontSize);
        } catch {
          wordWidth = word.length * (numFontSize * 0.6);
        }

        if (wordWidth > maxContentWidth) {
          if (currentLine) {
            linesToDraw.push({ text: currentLine, isSpacer: false, size: numFontSize, font });
            currentLine = '';
          }
          let chunk = '';
          for (const char of word) {
            const testChunk = chunk + char;
            let chunkWidth = 0;
            try {
              chunkWidth = font.widthOfTextAtSize(testChunk, numFontSize);
            } catch {
              chunkWidth = testChunk.length * (numFontSize * 0.6);
            }

            if (chunkWidth <= maxContentWidth) {
              chunk = testChunk;
            } else {
              if (chunk) linesToDraw.push({ text: chunk, isSpacer: false, size: numFontSize, font });
              chunk = char;
            }
          }
          currentLine = chunk;
          continue;
        }

        const testLine = currentLine ? `${currentLine} ${word}` : word;
        let testWidth = 0;
        try {
          testWidth = font.widthOfTextAtSize(testLine, numFontSize);
        } catch {
          testWidth = testLine.length * (numFontSize * 0.6);
        }

        if (testWidth <= maxContentWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            linesToDraw.push({ text: currentLine, isSpacer: false, size: numFontSize, font });
          }
          currentLine = word;
        }
      }
      if (currentLine) {
        linesToDraw.push({ text: currentLine, isSpacer: false, size: numFontSize, font });
      }
    }

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
    const bottomMargin = margin + (showPageNumbers ? 25 : 0);

    for (const item of linesToDraw) {
      const itemLineHeight = item.isTitle ? (item.size * 1.6) : lineHeight;

      if (y - itemLineHeight < bottomMargin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      if (item.isSpacer) {
        y -= lineHeight * 0.6;
      } else {
        try {
          page.drawText(item.text || ' ', {
            x: margin,
            y: y - (item.isTitle ? 4 : 0),
            size: item.size,
            font: item.font,
            color: rgb(0.12, 0.12, 0.15),
          });
        } catch {
          const asciiOnly = (item.text || ' ').replace(/[^\x20-\x7E]/g, '?');
          page.drawText(asciiOnly, {
            x: margin,
            y: y - (item.isTitle ? 4 : 0),
            size: item.size,
            font: item.font,
            color: rgb(0.12, 0.12, 0.15),
          });
        }
        y -= itemLineHeight;
      }
    }

    // Draw page numbers
    if (showPageNumbers) {
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;
      for (let i = 0; i < totalPages; i++) {
        const p = pages[i];
        const pageNumText = `Page ${i + 1} of ${totalPages}`;
        let pageNumWidth = 50;
        try {
          pageNumWidth = font.widthOfTextAtSize(pageNumText, 9);
        } catch {
          pageNumWidth = pageNumText.length * 5;
        }
        p.drawText(pageNumText, {
          x: (pageWidth - pageNumWidth) / 2,
          y: 25,
          size: 9,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const safeName = (titleName || documentTitle || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
    const outFileName = `${safeName}.pdf`;

    return { blobUrl, fileName: outFileName };
  };

  const handleConvert = async () => {
    let rawTextToProcess = textContent;

    if (activeTab === 'upload' && !rawTextToProcess.trim() && file) {
      try {
        rawTextToProcess = await file.text();
        setTextContent(rawTextToProcess);
      } catch {
        setErrorMessage('Could not read the uploaded text file.');
        return;
      }
    }

    if (!rawTextToProcess || !rawTextToProcess.trim()) {
      setErrorMessage(activeTab === 'upload' ? 'Please upload a text file with content.' : 'Please enter text to convert.');
      return;
    }

    setStatus('uploading');
    setErrorMessage('');

    try {
      // Simulate short micro-delay for smooth UX transition
      await new Promise(res => setTimeout(res, 400));
      
      const fileNameHint = file ? file.name.replace(/\.[^/.]+$/, '') : (documentTitle || 'converted_text');
      const generated = await generatePDFClientSide(rawTextToProcess, fileNameHint);

      setResult(generated);
      setStatus('success');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      setErrorMessage(error.message || 'Error converting text to PDF.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setTextContent('');
    setDocumentTitle('');
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
  };

  const loadSampleText = () => {
    setDocumentTitle('DocForge Technical Overview');
    setTextContent(
`# DocForge Document Processing Suite

DocForge provides seamless, high-performance document tools built directly for modern workflows.

Key Features & Highlights:
1. Fast Document Generation: Create clean, formatted PDFs with standard typography and automatic word wrapping.
2. Military-Grade Security: Enterprise-grade AES-256 PDF password protection.
3. Multi-Format Conversion: Convert images (JPG, PNG, WebP) and text into high-quality PDFs.
4. Intelligent Pagination: Handles multi-page documents with automatic footer page counters.

Action Items:
- All documents are processed securely and formatted with precision.
- Zero tracking, no registration required, and 100% free forever.`
    );
  };

  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const charCount = textContent.length;
  const lineCount = textContent ? textContent.split('\n').length : 0;

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '840px' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ 
            padding: '10px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={28} color="#fbbf24" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.85rem' }}>Text to PDF</h2>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              Convert text files, markdown, or direct typing into clean, professional PDF documents.
            </p>
          </div>
        </div>

        {status === 'idle' && (
          <div style={{ marginTop: '1.5rem' }}>
            {/* Input Mode Selector */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              background: 'rgba(255,255,255,0.04)', 
              padding: '4px', 
              borderRadius: '12px',
              marginBottom: '1.75rem',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'upload' ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
                  color: activeTab === 'upload' ? '#fbbf24' : 'var(--text-muted)',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Upload size={16} /> Upload Text File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('type')}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'type' ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
                  color: activeTab === 'type' ? '#fbbf24' : 'var(--text-muted)',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Edit3 size={16} /> Type or Paste Text
              </button>
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div>
                {!file ? (
                  <div 
                    className="upload-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    style={{
                      border: isDragging ? '2px dashed #fbbf24' : '2px dashed rgba(255, 255, 255, 0.15)',
                      backgroundColor: isDragging ? 'rgba(251, 191, 36, 0.08)' : 'rgba(255, 255, 255, 0.02)',
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
                      background: 'rgba(251, 191, 36, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem'
                    }}>
                      <FileText size={32} color="#fbbf24" />
                    </div>
                    <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                      Click to upload text file or drag & drop
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                      Supports .txt, .md, .log, .json, .csv, and code files
                    </p>
                    <input 
                      type="file" 
                      accept=".txt,.md,.log,.json,.csv,.js,.py,.html,.css,.xml,.ts,.jsx,.tsx,text/*" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                    />
                  </div>
                ) : (
                  <div style={{ 
                    padding: '1.25rem', 
                    background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.85rem', 
                    marginBottom: '1.5rem' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          padding: '8px', 
                          borderRadius: '8px', 
                          background: 'rgba(251, 191, 36, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={20} color="#fbbf24" />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{file.name}</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {(file.size / 1024).toFixed(2)} KB • {lineCount} lines • {wordCount} words
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setFile(null); setTextContent(''); }}
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
                          fontSize: '0.85rem'
                        }}
                      >
                        <X size={16} /> Remove
                      </button>
                    </div>

                    {/* Quick Preview Box */}
                    <div style={{
                      maxHeight: '120px',
                      overflowY: 'auto',
                      background: 'rgba(0,0,0,0.25)',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {textContent.substring(0, 500) + (textContent.length > 500 ? '...' : '')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Type / Paste Tab */}
            {activeTab === 'type' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
                    Document Content
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={loadSampleText}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fbbf24',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Sparkles size={14} /> Sample Text
                    </button>
                    {textContent && (
                      <button
                        type="button"
                        onClick={() => setTextContent('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <RotateCcw size={14} /> Clear
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={8}
                  placeholder="Paste or type your text here. Markdown and multi-paragraph text are formatted cleanly into pages..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '0.75rem',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    fontFamily: fontFamily === 'Courier' ? 'monospace' : 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '0.8rem', 
                  color: 'var(--text-muted)', 
                  marginTop: '0.4rem' 
                }}>
                  <span>{wordCount} words • {charCount} characters</span>
                  <span>{lineCount} lines</span>
                </div>
              </div>
            )}

            {/* Document Formatting Options */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0.85rem',
              padding: '1.25rem',
              marginTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '0.9rem', fontWeight: '600' }}>
                <Sliders size={16} /> PDF Layout & Styling Options
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Document Title (Printed as header)
                </label>
                <input 
                  type="text"
                  placeholder="e.g., Project Documentation or Meeting Notes"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    Font Style
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.75rem',
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Helvetica">Modern Sans (Helvetica)</option>
                    <option value="Times">Classic Serif (Times)</option>
                    <option value="Courier">Monospace / Code (Courier)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    Font Size
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.75rem',
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="10">Small (10pt)</option>
                    <option value="11">Regular (11pt - Recommended)</option>
                    <option value="13">Medium (13pt)</option>
                    <option value="15">Large (15pt)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    Page Format
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.75rem',
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="A4">A4 (Standard International)</option>
                    <option value="Letter">US Letter</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                  <input 
                    type="checkbox" 
                    checked={showPageNumbers} 
                    onChange={(e) => setShowPageNumbers(e.target.checked)}
                    style={{ accentColor: '#fbbf24', width: '16px', height: '16px' }}
                  />
                  Include page numbers (e.g. Page 1 of 3)
                </label>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div style={{
                marginTop: '1.25rem',
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

            {/* Convert Button */}
            <button 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                marginTop: '1.75rem', 
                height: '3.5rem', 
                background: (!file && !textContent.trim())
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: (!file && !textContent.trim()) ? 'var(--text-muted)' : '#0f172a',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: (!file && !textContent.trim()) ? 'not-allowed' : 'pointer',
                boxShadow: (!file && !textContent.trim()) ? 'none' : '0 8px 24px rgba(251, 191, 36, 0.25)'
              }}
              disabled={!file && !textContent.trim()}
              onClick={handleConvert}
            >
              <FileText size={18} /> Convert Text to PDF
            </button>
          </div>
        )}

        {status === 'uploading' && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Loader2 size={64} color="#fbbf24" style={{ marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Formatting & Converting to PDF...</h3>
            <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem' }}>
              Calculating word wrapping, laying out pages, and rendering document typography.
            </p>
          </div>
        )}

        {status === 'success' && result && (
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
              <CheckCircle size={40} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>PDF Generated Successfully!</h3>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
              {result.fileName || 'Your formatted document is ready.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a 
                href={result.blobUrl} 
                className="btn btn-primary" 
                style={{ 
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                  color: '#0f172a',
                  fontWeight: '700',
                  textDecoration: 'none',
                  padding: '0.85rem 2rem',
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                download={result.fileName}
              >
                <Download size={20} /> Download PDF
              </a>
              <button 
                className="btn btn-outline" 
                onClick={handleReset}
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-main)' }}
              >
                Convert Another Document
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
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Conversion Failed</h3>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
              {errorMessage || "We couldn't convert your text document. Please try again."}
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

export default TextTool;
