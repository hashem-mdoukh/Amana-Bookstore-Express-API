const fs = require("fs");
const path = require("path");
const { loadJSON } = require("../utils/fileUtils");

const reviewsPath = path.join(__dirname, "..", "..", "data", "reviews.json");

const addReview = (req, res) => {
  const reviewsData = loadJSON("reviews.json");
  const booksData = loadJSON("books.json");

  let reviews = reviewsData?.reviews || [];
  let books = booksData?.books || [];

  try {
    const { bookId, author, rating, title, comment } = req.body;

    if (!bookId || !author || !rating || !title) {
      return res.json({
        error: "bookId, author, rating, and title are required.",
        status: 400
      });
    }

    const bookExists = books.some((b) => b.id === bookId);
    if (!bookExists) {
      return res.json({
        error: `Book with ID ${bookId} not found.`,
        status: 404
      });
    }

    const maxIdNum = reviews.reduce((max, review) => {
      const num = parseInt(review.id?.split("-")[1], 10);
      return num && num > max ? num : max;
    }, 0);

    const newReviewId = `review-${maxIdNum + 1}`;

    const newReview = {
      id: newReviewId,
      bookId,
      author,
      rating,
      title,
      comment: comment || "",
      timestamp: new Date().toISOString(),
      verified: true,
    };

    reviews.push(newReview);
    fs.writeFileSync(reviewsPath, JSON.stringify({ reviews }, null, 2));

    res.json({
      message: "Review added successfully.",
      status: 201,
      review: newReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.json({ error: "Internal server error.", status: 500 });
  }
};

module.exports = {
  addReview,
};
