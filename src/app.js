const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./Configuration/db');
require('dotenv').config(); // Must be at the top
const fs = require('fs');
const path = require('path');
const booksRoutes = require('./routes/booksRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

// Define the path to data/logging/log.txt
const logFilePath = path.join(__dirname, '..', 'logging', 'log.txt');

// Create the directory if it doesn't exist (optional, but good practice)
const logDir = path.dirname(logFilePath);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Create a write stream (in 'a' append mode, so it never creates a new file, 
// but adds to the existing one).
const accessLogStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// --- START MIDDLEWARES ---

// 1. Logging Middleware (first to capture all requests)
app.use(morgan('combined', { stream: accessLogStream }));

// 2. Cross-Origin Resource Sharing
app.use(cors());
app.use(express.json()); 

// --- END MIDDLEWARES ---




// Routes
app.use('/api/books', booksRoutes);
app.use('/api/reviews', reviewsRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;