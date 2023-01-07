require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    let token = req.header('x-auth-token');
    console.log('!token', token);
    token = token.replace(/"/g, '');
    res.token = token;
    if (!token) {
      return res.status(401).json({ message: 'You are not logged in' });
    }
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded.user;
    next();
  } catch {
    res.status(401).json({ message: 'json-token is invalid' });
  }
};
