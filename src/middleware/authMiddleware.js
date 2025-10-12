// A very simple mock authentication middleware
const AUTH_TOKEN = 'mysecrettoken123'; // you can store this in .env in production

function authenticate(req, res, next) {
  const token = req.headers['authorization'];

  if (!token || token !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(403).json({ error: 'Access denied. Invalid or missing token.' });
  }

  next();
}

module.exports = authenticate;
