const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully with our server!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

module.exports = connectDB;
