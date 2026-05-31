const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pdfController = require('../controllers/pdfController');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Endpoints
router.post('/merge', upload.array('files'), pdfController.mergePDFs);
router.post('/image-to-pdf', upload.array('images'), pdfController.imageToPDF);
router.post('/text-to-pdf', upload.single('file'), pdfController.textToPDF);
router.get('/download/:filename', pdfController.downloadPDF);
router.post('/protect', upload.single('file'), pdfController.protectPDF);

module.exports = router;
