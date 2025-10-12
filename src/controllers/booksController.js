const fs = require("fs");
const path = require("path");
const { loadJSON } = require("../utils/fileUtils");

const booksPath = path.join(__dirname, "..", "..", "data", "books.json");

const booksData = loadJSON("books.json");
const reviewsData = loadJSON("reviews.json");

let books = booksData?.books || [];
let reviews = reviewsData?.reviews || [];

// Get all books
const getAllBooks = (res) => {
  res.json({
    message: "All books retrieved successfully",
    status: 200,
    count: books.length,
    data: books,
  });
};

// Get book by ID
const getBookById = (req, res) => {
  const { id } = req.params;

  const book = books.find((b) => b.id === +id);

  if (!book)
    return res.json({
      error: "Book not found please Porvide a a vailde ID",
      status: 404,
    });
  res.json({
    message: "Book By ID retrieved successfully",
    status: 200,
    data: book,
  });
};

// Get books within date range
const getBooksByRange = (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.json({
      error:
        "Please provide both 'start' and 'end' query parameters (YYYY-MM-DD).",
      status: 400,
    });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.json({
      error: "Invalid date format. Please use the format YYYY-MM-DD.",
      status: 400,
    });
  }

  if (startDate > endDate) {
    return res.json({
      error: "'start' date must be earlier than or equal to 'end' date.",
      status: 400,
    });
  }

  const filtered = books.filter((b) => {
    const date = new Date(b.datePublished);
    return date >= startDate && date <= endDate;
  });

  res.status(200).json({
    message: "Books retrieved successfully by date range.",
    count: filtered.length,
    data: filtered,
  });
};

// Get top-rated books
const getTopRatedBooks = (res) => {
  const sorted = [...books].sort(
    (a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount
  );
  res.json({
    message: "Top-rated books retrieved successfully",
    status: 200,
    data: sorted.slice(0, 10),
  });
};

// Get featured books
const getFeaturedBooks = (res) => {
  const featured = books.filter((b) => b.featured);
  res.json({
    message: "Featured books retrieved successfully",
    status: 200,
    data: featured,
  });
};

// Get reviews for specific book
const getBookReviews = (req, res) => {
  const { id } = req.params;
  const bookExists = books.some((b) => b.id === +id);
  if (!bookExists) return res.json({ error: "Book not found", status: 404 });

  const related = reviews.filter((r) => r.bookId === +id);
  res.json({
    message: "Book reviews retrieved successfully",
    status: 200,
    data: related,
  });
};

// Get book by search
const searchBooks = (req, res) => {
  try {
    const { name, start, end, rate } = req.query;

    if (!books || books.length === 0) {
      return res.json({ 
        error: "No books available.",
        status: 404,
      });
    }

    let filtered = books;

    if (name) {
      const lowerName = name.toLowerCase();
      filtered = filtered.filter((b) =>
        b.title.toLowerCase().includes(lowerName)
      );
    }

    if (start || end) {
      const startDate = start ? new Date(start) : new Date("1900-01-01");
      const endDate = end ? new Date(end) : new Date();

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.json({ 
          error: "Invalid date format. Use YYYY-MM-DD.",
          status: 400,
        });
      }

      if (startDate > endDate) {
        return res.json({
          error: "'start' date must be before 'end' date.",
          status: 400,
        });
      }

      filtered = filtered.filter((b) => {
        const bookDate = new Date(b.datePublished);
        return bookDate >= startDate && bookDate <= endDate;
      });
    }

    if (rate) {
      const rateNum = parseFloat(rate);
      if (isNaN(rateNum) || rateNum < 0 || rateNum > 5) {
        return res.json({
          error: "Rate must be a number between 0 and 5.",
          status: 400,
        });
      }

      filtered = filtered.filter((b) => b.rating >= rateNum);
    }

    res.json({
      message: "Books filtered successfully.",
      status: 200,
      totalResults: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error("Error filtering books:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// POST: Add a new book
const addBook = (req, res) => {
  const maxId = books.reduce((max, book) => {
    const currentIdNum = parseInt(book.id, 10);
    return currentIdNum && currentIdNum > max ? currentIdNum : max;
  }, 0);

  const newId = maxId + 1;

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
    return res.json({
      error: "Title and author are required.",
      status: 400,
    });
  }

  const newBook = {
    id: newId,
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

  res.json({
    message: "Book added successfully",
    status: 201,
    book: newBook,
  });
};

const deleteBookById = (req, res) => {
  const { id } = req.params;

  try {
    const bookIndex = books.findIndex((b) => b.id === +id);

    if (bookIndex === -1) {
      return res.json({
        error: "Book not found",
        status: 404,
      });
    }

    books.splice(bookIndex, 1);

    fs.writeFileSync(booksPath, JSON.stringify({ books }, null, 2));

    res.json({
      message: "Book deleted successfully",
      status: 200,
    });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
      status: 500,
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  getBooksByRange,
  getTopRatedBooks,
  getFeaturedBooks,
  getBookReviews,
  searchBooks,
  addBook,
  deleteBookById,
};
