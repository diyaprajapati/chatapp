const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URI || 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Middle ware
let io;

app.use((req, res, next) => {
    req.io = io; // Make io accessible in routes
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');

        // ----------- Socket Server Setup -------------
        const server = http.createServer(app);

        const io = new Server(server, {
            pingTimeout: 60000,
            cors: {
                origin: process.env.FRONTEND_URI || 'http://localhost:8080',
                credentials: true,
            },
            path: '/socket.io',
            connectTimeout: 10000,
            serveClient: false
        });

        // Store online users
        const onlineUsers = new Map();

        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            // User joins their personal room
            socket.on('setup', (userData) => {
                socket.join(userData._id);
                onlineUsers.set(userData._id, socket.id);

                // Broadcast user online status
                socket.broadcast.emit('user online', userData._id);
                socket.emit('connected');

                console.log(`User ${userData.username} connected`);
            });

            // Join specific chat room
            socket.on('join chat', (chatId) => {
                socket.join(chatId);
                console.log(`User joined chat: ${chatId}`);
            });

            // Leave specific chat room
            socket.on('leave chat', (chatId) => {
                socket.leave(chatId);
                console.log(`User left chat: ${chatId}`);
            });

            // Handle new message
            socket.on('new message', (messageData) => {
                const { chatId, message } = messageData;

                // Emit to all users in the chat room except sender
                socket.to(chatId).emit('message received', message);

                // Also emit to individual user rooms for participants
                if (message.chatId && message.chatId.participants) {
                    message.chatId.participants.forEach((participant) => {
                        if (participant._id !== message.userId._id) {
                            socket.to(participant._id).emit('message received', message);
                        }
                    });
                }
            });

            // Handle typing indicators
            socket.on('typing', (data) => {
                socket.to(data.chatId).emit('typing', data);
            });

            socket.on('stop typing', (data) => {
                socket.to(data.chatId).emit('stop typing', data);
            });

            // Handle user disconnect
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);

                // Find and remove user from online users
                for (const [userId, socketId] of onlineUsers.entries()) {
                    if (socketId === socket.id) {
                        onlineUsers.delete(userId);
                        // Broadcast user offline status
                        socket.broadcast.emit('user offline', userId);
                        break;
                    }
                }
            });

            // Handle manual logout
            socket.on('logout', (userId) => {
                onlineUsers.delete(userId);
                socket.broadcast.emit('user offline', userId);
                socket.disconnect();
            });
        });

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => console.error('DB connection error:', err));