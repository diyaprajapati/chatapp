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
    origin: 'http://localhost:8080',
    credentials: true
}));


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        // app.listen(PORT, () => console.log(`Server running on ${PORT}`));

        // ----------- Socket Server Setup -------------
        const server = http.createServer(app);

        const io = new Server(server, {
            pingTimeout: 60000,
            cors: {
                origin: process.env.FRONTEND_URI,
                credentials: true,
            }
        });

        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            socket.on('setup', (userData) => {
                socket.join(userData._id);
                socket.emit('connected');
            });

            socket.on('new message', (newMessage) => {
                const chat = newMessage.chat;
                if (!chat.users) return;

                chat.users.forEach((user) => {
                    if (user._id === newMessage.sender._id) return;
                    socket.in(user._id).emit('message received', newMessage);
                });
            });
            socket.on('disconnect', () => {
                console.log('Client disconnected: ', socket.id);
            });
        });
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => console.error('DB connection error:', err));
