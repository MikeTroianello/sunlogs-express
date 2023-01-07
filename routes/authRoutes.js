const express = require('express');
const authRoutes = express.Router();

const auth = require('../middleware/auth');

const {
  signup,
  login,
  logout,
  loggedIn,
  changeInfo,
  deleteUser,
} = require('../controllers/authRoutes');

authRoutes.post('/signup', signup);

authRoutes.post('/login', login);

authRoutes.post('/logout', logout);

authRoutes.get('/loggedin/:day/:year', auth, loggedIn);

authRoutes.post('/change-info', auth, changeInfo);

authRoutes.post('/delete-user', auth, deleteUser);

module.exports = authRoutes;
