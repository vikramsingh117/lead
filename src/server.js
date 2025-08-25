require('dotenv').config();
const express = require('express');
const leadRoutes = require('./routes/leadRoutes');

const app = express();

// Basic middleware for JSON parsing
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Mount routes
app.use('/api/leads', leadRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});