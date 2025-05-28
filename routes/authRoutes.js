const express = require('express');
const router = express.Router();
const { signup, login,getAuthUser } = require('../controllers/Auth');

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

router.get('/me', getAuthUser); 

// // POST /api/auth/logout
// router.post('/logout', logout);

module.exports = router;
