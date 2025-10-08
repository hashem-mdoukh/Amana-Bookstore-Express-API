const app = require('./src/app');
const PORT = process.env.PORT || 3000;

// Run server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});