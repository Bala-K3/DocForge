const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfController = require('../controllers/pdfController');

// Multer in-memory storage configuration (0 disk storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max file size limit
    }
});

// Endpoints
router.post('/merge', upload.array('files'), pdfController.mergePDFs);
router.post('/image-to-pdf', upload.array('images'), pdfController.imageToPDF);
router.post('/text-to-pdf', upload.single('file'), pdfController.textToPDF);
router.post('/protect', upload.single('file'), pdfController.protectPDF);

module.exports = router;
