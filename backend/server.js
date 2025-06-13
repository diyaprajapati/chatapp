const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
// app.use('/api/messages', require('./routes/messageRoutes'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    })
    .catch((err) => console.error('DB connection error:', err));
