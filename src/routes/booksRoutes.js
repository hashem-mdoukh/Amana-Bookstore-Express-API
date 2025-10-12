const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', booksController.getAllBooks);
router.get('/range', booksController.getBooksByRange);
router.get('/top-rated', booksController.getTopRatedBooks);
router.get('/featured', booksController.getFeaturedBooks);
router.get('/search', booksController.searchBooks);
router.get('/:id/reviews', booksController.getBookReviews);
router.get('/:id', booksController.getBookById);


router.post('/', authenticate, booksController.addBook);

router.delete('/:id', authenticate, booksController.deleteBookById);


module.exports = router;
