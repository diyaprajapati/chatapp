const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');
const User = require('../models/User');

// POST /api/messages - Send a new message
exports.sendMessage = async (req, res) => {
    const { content, chatId } = req.body;
    const userId = req.user.id;

    try {
        // Validate chat exists and user is participant
        const chat = await Chat.findOne({
            _id: chatId,
            participants: { $in: [userId] }
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found or access denied' });
        }

        // Create new message
        const newMessage = await Message.create({
            userId,
            content,
            chatId,
            readBy: [{ user: userId, readAt: new Date() }]
        });

        // Update chat's latest message and updatedAt
        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: newMessage._id,
            updatedAt: new Date()
        });

        // Populate the message with user details
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('userId', 'firstName lastName username avatar')
            .populate('chatId', 'participants');

        res.status(201).json(populatedMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/messages/:chatId - Get all messages for a specific chat
exports.getChatMessages = async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    try {
        // Validate chat exists and user is participant
        const chat = await Chat.findOne({
            _id: chatId,
            participants: { $in: [userId] }
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found or access denied' });
        }

        // Get messages with pagination
        const messages = await Message.find({ chatId })
            .populate('userId', 'firstName lastName username avatar')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        // Get total count for pagination
        const totalMessages = await Message.countDocuments({ chatId });
        const totalPages = Math.ceil(totalMessages / limit);

        res.json({
            messages: messages.reverse(), // Reverse to show oldest first
            pagination: {
                currentPage: page,
                totalPages,
                totalMessages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/messages/:messageId/read - Mark message as read
exports.markMessageAsRead = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is participant in the chat
        const chat = await Chat.findOne({
            _id: message.chatId,
            participants: { $in: [userId] }
        });

        if (!chat) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if already marked as read by this user
        const alreadyRead = message.readBy.some(read => read.user.toString() === userId);

        if (!alreadyRead) {
            message.readBy.push({
                user: userId,
                readAt: new Date()
            });
            await message.save();
        }

        res.json({ message: 'Message marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};