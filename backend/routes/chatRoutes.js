const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const Chat = require('../models/chatModel');
const User = require('../models/User');

// access or create 1-on-1 chat
router.post('/', protect, async (req, res) => {
    const { userId } = req.body;

    if (!userId) return res.status(400).send('UserId param not sent');

    let chat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [req.user._id, userId] },
    }).populate('users', '-password').populate('latestMessage');

    if (chat) return res.status(200).json(chat);

    //create new chat
    const newChat = await Chat.create({
        users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate('users', '-password');

    return res.status(200).json(fullChat);
});

// get all chats of logged in user
router.get('/', protect, async (req, res) => {
    const chats = await Chat.find({
        users: { $elemMatch: { $eq: req.user._id } },
    })
        .populate('users', '-password')
        .populate('latestMessage')
        .sort({ updatedAt: -1 });

    res.status(200).json(chats);
})

module.exports = router;