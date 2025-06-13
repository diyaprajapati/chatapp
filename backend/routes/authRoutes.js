const express = require('express');
const { register, login, searchUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/search', protect, searchUser);

module.exports = router;
