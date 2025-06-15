const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');
const User = require('../models/User');

// POST /api/messages - Send a new message
exports.sendMessage = async (req, res) => {
    const { content, chatId } = req.body;
    const userId = req.user.id;

    try {
        // Validate input
        if (!content || !chatId) {
            return res.status(400).json({ message: 'Content and chatId are required' });
        }

        // Validate chat exists and user is participant
        const chat = await Chat.findOne({
            _id: chatId,
            participants: { $in: [userId] }
        }).populate('participants', 'firstName lastName username avatar');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found or access denied' });
        }

        // Create message
        const newMessage = await Message.create({
            userId,
            content,
            chatId,
            readBy: [{ user: userId, readAt: new Date() }]
        });

        // Populate the message before sending
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('userId', 'firstName lastName username avatar')
            .populate('chatId', 'participants');

        // Update chat's latest message
        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: newMessage._id,
            updatedAt: new Date()
        });

        // Emit to all participants
        req.io.to(chatId).emit('message received', populatedMessage);
        if (Array.isArray(chat.participants)) {
            chat.participants.forEach(participant => {
                const participantId = participant._id ? participant._id.toString() : participant.toString();
                if (participantId !== userId.toString()) {
                    req.io.to(participantId).emit('chat updated', {
                        chatId,
                        latestMessage: populatedMessage
                    });
                }
            });
        }

        res.status(201).json(populatedMessage);

    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({
            message: 'Error sending message',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
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
        }).populate('participants', 'firstName lastName username avatar');

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
            chat,
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