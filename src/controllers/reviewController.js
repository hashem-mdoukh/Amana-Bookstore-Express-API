const fs = require("fs");
const path = require("path");
const { loadJSON } = require("../utils/fileUtils");

const reviewsPath = path.join(__dirname, "..", "..", "data", "reviews.json");
const booksPath = path.join(__dirname, "..", "..", "data", "books.json");

// ✅ إضافة تقييم جديد
exports.addReview = (req, res) => {
  // تحميل البيانات
  const reviewsData = loadJSON("reviews.json");
  const booksData = loadJSON("books.json");

  let reviews = reviewsData?.reviews || [];
  let books = booksData?.books || [];

  try {
    const { bookId, author, rating, title, comment } = req.body;

    // التحقق من الحقول المطلوبة
    if (!bookId || !author || !rating || !title) {
      return res.status(400).json({
        error: "bookId, author, rating, and title are required.",
      });
    }

    // ✅ تعريف targetBookId
    const targetBookId = parseInt(bookId, 10);

    // ✅ التحقق من وجود الكتاب فعلاً
    const bookExists = books.some((b) => String(b.id) === String(targetBookId));
    if (!bookExists) {
      return res.status(404).json({
        error: `Book with ID ${bookId} not found.`,
      });
    }

    // ✅ توليد ID تسلسلي جديد للمراجعة
    const maxIdNum = reviews.reduce((max, review) => {
      const num = parseInt(review.id?.split("-")[1], 10);
      return num && num > max ? num : max;
    }, 0);

    const newReviewId = `review-${maxIdNum + 1}`;

    // ✅ بناء المراجعة الجديدة
    const newReview = {
      id: newReviewId,
      bookId: targetBookId,
      author,
      rating,
      title,
      comment: comment || "",
      timestamp: new Date().toISOString(),
      verified: true,
    };

    // ✅ حفظ المراجعة في المصفوفة والملف
    reviews.push(newReview);
    fs.writeFileSync(reviewsPath, JSON.stringify({ reviews }, null, 2));

    // ✅ إرسال الرد
    res.status(201).json({
      message: "Review added successfully.",
      review: newReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
