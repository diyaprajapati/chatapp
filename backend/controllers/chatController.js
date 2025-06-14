const Chat = require('../models/chatModel');
const User = require('../models/User');
const Message = require('../models/messageModel');

// POST /api/chats - Create or get existing chat between users
exports.createChat = async (req, res) => {
    const { participants } = req.body;
    const userId = req.user.id;

    try {
        // Add current user to participants if not already included
        const allParticipants = participants.includes(userId)
            ? participants
            : [...participants, userId];

        // Check if chat already exists between these participants
        const existingChat = await Chat.findOne({
            participants: { $all: allParticipants, $size: allParticipants.length }
        }).populate('participants', 'firstName lastName username avatar')
            .populate('latestMessage');

        if (existingChat) {
            return res.json(existingChat);
        }

        // Validate all participants exist
        const validUsers = await User.find({ _id: { $in: allParticipants } });
        if (validUsers.length !== allParticipants.length) {
            return res.status(400).json({ message: 'One or more participants not found' });
        }

        // Create new chat
        const newChat = await Chat.create({
            participants: allParticipants
        });

        const populatedChat = await Chat.findById(newChat._id)
            .populate('participants', 'firstName lastName username avatar')
            .populate('latestMessage');

        res.status(201).json(populatedChat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/chats - Get all chats for logged in user
exports.getUserChats = async (req, res) => {
    const userId = req.user.id;

    try {
        const chats = await Chat.find({
            participants: { $in: [userId] }
        })
            .populate('participants', 'firstName lastName username avatar isOnline lastSeen')
            .populate({
                path: 'latestMessage',
                populate: {
                    path: 'userId',
                    select: 'firstName lastName username'
                }
            })
            .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/chats/:id - Get specific chat by ID
exports.getChatById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const chat = await Chat.findOne({
            _id: id,
            participants: { $in: [userId] }
        })
            .populate('participants', 'firstName lastName username avatar isOnline lastSeen')
            .populate('latestMessage');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found or access denied' });
        }

        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};