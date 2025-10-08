const express = require('express');
const cors = require('cors');
const booksRoutes = require('./routes/booksRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/books', booksRoutes);
app.use('/api/reviews', reviewsRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
