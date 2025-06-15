const express = require('express');
const { register, login, searchUser, updateUserStatus } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/search', protect, searchUser);
router.put('/status', protect, updateUserStatus);

module.exports = router;
