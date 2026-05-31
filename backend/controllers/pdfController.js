const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

exports.mergePDFs = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length < 2) {
            return res.status(400).json({ message: 'Please upload at least two PDF files to merge.' });
        }

        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            const pdfBytes = fs.readFileSync(file.path);
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const fileName = `merged-${uuidv4()}.pdf`;
        const filePath = path.join(__dirname, '../uploads', fileName);

        fs.writeFileSync(filePath, mergedPdfBytes);

        // Cleanup uploaded files
        files.forEach(file => fs.unlinkSync(file.path));

        res.json({ 
            message: 'PDFs merged successfully', 
            downloadUrl: `/api/pdf/download/${fileName}`,
            fileName 
        });
    } catch (error) {
        console.error('Merge Error:', error);
        res.status(500).json({ message: 'Error merging PDFs', error: error.message });
    }
};

exports.imageToPDF = async (req, res) => {
    try {
        const images = req.files;
        if (!images || images.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one image.' });
        }

        const pdfDoc = await PDFDocument.create();

        for (const img of images) {
            const imageBuffer = fs.readFileSync(img.path);
            const metadata = await sharp(imageBuffer).metadata();
            
            // Convert image to JPEG buffer for pdf-lib compatibility if needed, 
            // though pdf-lib supports PNG and JPEG. Let's ensure it's a standard format.
            const processedImage = await sharp(imageBuffer).toFormat('jpeg').toBuffer();
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
        const fileName = `converted-${uuidv4()}.pdf`;
        const filePath = path.join(__dirname, '../uploads', fileName);

        fs.writeFileSync(filePath, pdfBytes);

        // Cleanup uploaded images
        images.forEach(img => fs.unlinkSync(img.path));

        res.json({ 
            message: 'Images converted to PDF successfully', 
            downloadUrl: `/api/pdf/download/${fileName}`,
            fileName 
        });
    } catch (error) {
        console.error('Convert Error:', error);
        res.status(500).json({ message: 'Error converting images to PDF', error: error.message });
    }
};

exports.textToPDF = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'Please upload a text file.' });
        }

        const text = fs.readFileSync(file.path, 'utf8');
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage();
        let { height } = page.getSize();
        
        // Split text into lines and handle \r\n
        const lines = text.replace(/\r\n/g, '\n').split('\n');
        let y = height - 50;

        for (const line of lines) {
            if (y < 50) {
                page = pdfDoc.addPage();
                y = page.getSize().height - 50;
            }
            
            page.drawText(line || ' ', { 
                x: 50, 
                y, 
                size: 11,
            });
            
            y -= 18;
        }

        const pdfBytes = await pdfDoc.save();
        const fileName = `text-${uuidv4()}.pdf`;
        const filePath = path.join(__dirname, '../uploads', fileName);

        fs.writeFileSync(filePath, pdfBytes);
        fs.unlinkSync(file.path);

        res.json({ 
            message: 'Text converted to PDF successfully', 
            downloadUrl: `/api/pdf/download/${fileName}`,
            fileName 
        });
    } catch (error) {
        console.error('Text Error:', error);
        res.status(500).json({ message: 'Error converting text to PDF', error: error.message });
    }
};

exports.downloadPDF = (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', fileName);

    if (fs.existsSync(filePath)) {
        res.download(filePath, fileName);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
};

exports.protectPDF = async (req, res) => {
    try {
        const file = req.file;
        const { password } = req.body;

        if (!file || !password) {
            return res.status(400).json({ message: 'Please upload a PDF and provide a password.' });
        }

        const pdfBytes = fs.readFileSync(file.path);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Note: pdf-lib doesn't natively support password encryption yet.
        // We might need another library like 'qpdf' or 'node-qpdf' for encryption.
        // For now, I will use a placeholder or implement it if possible.
        // Wait, 'pdf-lib' DOES NOT support encryption.
        // I'll use 'node-qpdf' or similar if available, but let's try a simpler approach if possible.
        // Actually, let's use 'pizzip' or something? No.
        // I'll try to find a pure JS library for encryption.
        
        // For the sake of this demo, if I can't find a pure JS library easily, 
        // I'll implement a "protected" metadata field or use another tool.
        // Actually, 'muhammara' or 'hummus' can do it but they are native.
        
        // Let's use 'pdf-lib' but warn that encryption is a premium feature 
        // or use a library like 'qpdf' if I can install it.
        // Since I can't easily install system binaries, I'll use a mock for now 
        // or look for a JS-only solution.
        
        // REVISION: I'll use 'hummus-recipe' if possible, but 'pdf-lib' is better for merging.
        // Let's stick to a message for now or find a JS library.
        
        res.status(501).json({ message: 'Password protection is currently in development (requires native binaries).' });
        
        // Cleanup
        fs.unlinkSync(file.path);

    } catch (error) {
        console.error('Protect Error:', error);
        res.status(500).json({ message: 'Error protecting PDF', error: error.message });
    }
};
