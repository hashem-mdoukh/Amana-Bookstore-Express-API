const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewController');
const authenticate = require('../middleware/authMiddleware');

// Add a new review
router.post('/', authenticate, reviewsController.addReview);

module.exports = router;
