const express = require('express');
const {
    sendMessage,
    getChatMessages,
    markMessageAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/messages - Send a new message
router.post('/', protect, sendMessage);

// GET /api/messages/:chatId - Get all messages for a specific chat
router.get('/:chatId', protect, getChatMessages);

// PUT /api/messages/:messageId/read - Mark message as read
router.put('/:messageId/read', protect, markMessageAsRead);

module.exports = router;