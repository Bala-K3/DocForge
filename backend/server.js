const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pdfRoutes = require('./routes/pdfRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/pdf', pdfRoutes);

app.get('/', (req, res) => {
    res.send('DocForge API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
