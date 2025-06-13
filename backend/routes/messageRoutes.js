const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');

// ✉️ Send a message
router.post('/', protect, async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.status(400).send('Missing content or chatId');
    }

    const newMessage = await Message.create({
        sender: req.user._id,
        content,
        chat: chatId,
    });

    // Update latest message in chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

    const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'firstName lastName username')
        .populate('chat');

    res.status(200).json(populatedMessage);
});

// 📥 Fetch messages of a chat
router.get('/:chatId', protect, async (req, res) => {
    const messages = await Message.find({ chat: req.params.chatId })
        .populate('sender', 'firstName lastName username')
        .populate('chat');

    res.status(200).json(messages);
});

module.exports = router;
