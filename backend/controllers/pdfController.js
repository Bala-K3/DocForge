const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { encryptPDF } = require('@pdfsmaller/pdf-encrypt');
const path = require('path');
const sharp = require('sharp');

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
        .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '?'); // sanitize remaining unencodable characters
}

// 1. In-Memory PDF Merge (Zero Storage)
exports.mergePDFs = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length < 2) {
            return res.status(400).json({ message: 'Please upload at least two PDF files to merge.' });
        }

        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            const pdf = await PDFDocument.load(file.buffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="merged-document.pdf"');
        return res.send(Buffer.from(mergedPdfBytes));
    } catch (error) {
        console.error('Merge Error:', error);
        return res.status(500).json({ message: 'Error merging PDFs: ' + error.message });
    }
};

// 2. In-Memory Image to PDF (Zero Storage)
exports.imageToPDF = async (req, res) => {
    try {
        const images = req.files;
        if (!images || images.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one image.' });
        }

        const pdfDoc = await PDFDocument.create();

        for (const img of images) {
            const processedImage = await sharp(img.buffer).toFormat('jpeg').toBuffer();
            const pdfImage = await pdfDoc.embedJpg(processedImage);
            
            const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
            page.drawImage(pdfImage, {
                x: 0,
                y: 0,
                width: pdfImage.width,
                height: pdfImage.height,
            });
        }

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="converted-images.pdf"');
        return res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Convert Error:', error);
        return res.status(500).json({ message: 'Error converting images to PDF: ' + error.message });
    }
};

// 3. In-Memory Text to PDF (Zero Storage)
exports.textToPDF = async (req, res) => {
    try {
        let rawText = '';
        let originalFileName = 'document';

        if (req.file) {
            rawText = req.file.buffer.toString('utf8');
            originalFileName = path.parse(req.file.originalname).name;
        } else if (req.body && req.body.text && typeof req.body.text === 'string' && req.body.text.trim()) {
            rawText = req.body.text;
            if (req.body.fileName) {
                originalFileName = req.body.fileName;
            }
        } else {
            return res.status(400).json({ message: 'Please upload a text file or provide text content.' });
        }

        const text = sanitizeTextForPDF(rawText);
        const {
            title = '',
            fontFamily = 'Helvetica',
            fontSize = 11,
            pageSize = 'A4',
            showPageNumbers = true
        } = req.body || {};

        const cleanTitle = sanitizeTextForPDF(title);
        const numFontSize = Math.max(8, Math.min(24, parseInt(fontSize, 10) || 11));
        const lineHeight = numFontSize * 1.5;
        const margin = 50;

        // Page dimensions in points
        let pageWidth = 595.28; // A4
        let pageHeight = 841.89;
        if (pageSize === 'Letter') {
            pageWidth = 612;
            pageHeight = 792;
        }

        const maxContentWidth = Math.max(100, pageWidth - (margin * 2));

        const pdfDoc = await PDFDocument.create();

        // Select Font
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

        const paragraphs = text.split('\n');
        const linesToDraw = [];

        // Add document title if provided
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

        // Draw page numbers if enabled
        if (showPageNumbers !== 'false' && showPageNumbers !== false) {
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
        const safeName = `${originalFileName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
        return res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Text Error:', error);
        return res.status(500).json({ message: 'Error converting text to PDF: ' + error.message });
    }
};

// 4. In-Memory PDF Password Protection (Zero Storage)
exports.protectPDF = async (req, res) => {
    try {
        const file = req.file;
        const { password, ownerPassword, allowPrinting, allowCopying, allowModifying } = req.body;

        if (!file) {
            return res.status(400).json({ message: 'Please upload a PDF file.' });
        }

        if (!password || password.trim() === '') {
            return res.status(400).json({ message: 'Please provide a password to protect your PDF.' });
        }

        const options = {
            ownerPassword: ownerPassword && ownerPassword.trim() !== '' ? ownerPassword : password,
            allowPrinting: allowPrinting !== 'false' && allowPrinting !== false,
            allowCopying: allowCopying !== 'false' && allowCopying !== false,
            allowModifying: allowModifying === 'true' || allowModifying === true
        };

        const encryptedBytes = await encryptPDF(new Uint8Array(file.buffer), password, options);

        const originalName = file.originalname ? path.parse(file.originalname).name : 'document';
        const safeName = `${originalName.replace(/[^a-zA-Z0-9_-]/g, '_')}_protected.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
        return res.send(Buffer.from(encryptedBytes));
    } catch (error) {
        console.error('Protect Error:', error);
        return res.status(500).json({ 
            message: 'Failed to protect PDF. The document might already be encrypted or corrupted.', 
            error: error.message 
        });
    }
};
