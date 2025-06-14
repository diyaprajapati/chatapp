const express = require('express');
const {
    createChat,
    getUserChats,
    getChatById
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/chats - Create or get existing chat
router.post('/', protect, createChat);

// GET /api/chats - Get all chats for logged in user
router.get('/', protect, getUserChats);

// GET /api/chats/:id - Get specific chat by ID
router.get('/:id', protect, getChatById);

module.exports = router;