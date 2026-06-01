const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const pdfRoutes = require('./routes/pdfRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/pdf', pdfRoutes);

app.get('/', (req, res) => {
    res.send('DocForge API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
