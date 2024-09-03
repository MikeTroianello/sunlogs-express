require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, _, next) => {
  const token = req.header('x-auth-token');

  const decoded = jwt.verify(token, process.env.SECRET);
  const { user } = decoded || {};
  const { id } = user || {};
  /**
   *  "you" is the logged in user
   *  maybe change this name to avoid confusion
   */
  const you = Boolean(id);
  req.user = { id, you };
  next();
};
