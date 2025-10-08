const fs = require('fs');
const path = require('path');

function loadJSON(filename) {
  try {
    const filePath = path.join(__dirname, '..', '..', 'data', filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return null;
  }
}

module.exports = { loadJSON };
