const fs = require("fs");
const path = require("path");
const { loadJSON } = require("../utils/fileUtils");

const booksPath = path.join(__dirname, "..", "..", "data", "books.json");
const reviewsPath = path.join(__dirname, "..", "..", "data", "reviews.json");

const booksData = loadJSON("books.json");
const reviewsData = loadJSON("reviews.json");

let books = booksData?.books || [];
let reviews = reviewsData?.reviews || [];

// Get all books
exports.getAllBooks = (req, res) => {
  res.json(books);
};

// Get book by ID
exports.getBookById = (req, res) => {
  const { id } = req.params;

  const book = books.find((b) => b.id.toString() === id.toString());

  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
};

// Get books within date range
exports.getBooksByRange = (req, res) => {
  const { start, end } = req.query;
  if (!start || !end)
    return res.status(400).json({
      error: "Please provide start and end query parameters (YYYY-MM-DD)",
    });

  const startDate = new Date(start);
  const endDate = new Date(end);

  const filtered = books.filter((b) => {
    const date = new Date(b.datePublished);
    return date >= startDate && date <= endDate;
  });

  res.json(filtered);
};

// Get top-rated books
exports.getTopRatedBooks = (req, res) => {
  const sorted = [...books].sort(
    (a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount
  );
  res.json(sorted.slice(0, 10));
};

// Get featured books
exports.getFeaturedBooks = (req, res) => {
  const featured = books.filter((b) => b.featured);
  res.json(featured);
};

// Get reviews for specific book
exports.getBookReviews = (req, res) => {
  const { id } = req.params;
  const bookExists = books.some((b) => b.id.toString() === id.toString());
  if (!bookExists) return res.status(404).json({ error: "Book not found" });

  const related = reviews.filter((r) => r.bookId.toString() === id.toString());
  res.json(related);
};

// POST: Add a new book
exports.addBook = (req, res) => {
  // 1. منطق توليد ID رقمي فريد
  // // نجد أكبر ID رقمي حالي ونضيف عليه 1
  // const maxId = books.reduce((max, book) => {
  //   // التأكد من أن الـ ID هو رقم صحيح قبل المقارنة، وإلا نعتبره 0
  //   const currentIdNum = parseInt(book.id, 10);
  //   return currentIdNum && currentIdNum > max ? currentIdNum : max;
  // }, 0);

  // const newId = maxId + 1; // <--- ID الآن هو رقم صحيح (مثل 101)

  const {
    title,
    author,
    description,
    price,
    image,
    isbn,
    genre,
    tags,
    datePublished,
    pages,
    language,
    publisher,
    rating,
    reviewCount,
    inStock,
    featured,
  } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: "Title and author are required." });
  }

  const newBook = {
    id: 160,
    title,
    author,
    description: description || "No description provided.",
    price: price !== undefined ? price : 0,
    image: image || "/images/default.jpg",
    isbn: isbn || "000-0000000000",
    genre: Array.isArray(genre) ? genre : [],
    tags: Array.isArray(tags) ? tags : [],
    datePublished: datePublished || new Date().toISOString().split("T")[0],
    pages: pages !== undefined ? pages : 0,
    language: language || "English",
    publisher: publisher || "Unknown Publisher",
    rating: rating !== undefined ? rating : 0,
    reviewCount: reviewCount !== undefined ? reviewCount : 0,
    inStock: typeof inStock === "boolean" ? inStock : false,
    featured: typeof featured === "boolean" ? featured : false,
  };

  books.push(newBook);

  fs.writeFileSync(booksPath, JSON.stringify({ books }, null, 2));

  res.status(201).json({ message: "Book added successfully", book: newBook });
};

exports.deleteBookById = (req, res) => {
  const { id } = req.params;

  try {
    const bookIndex = books.findIndex((b) => b.id.toString() === id.toString());

    if (bookIndex === -1) {
      return res.status(404).json({ error: "Book not found" });
    }

    books.splice(bookIndex, 1);

    fs.writeFileSync(booksPath, JSON.stringify({ books }, null, 2));

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
