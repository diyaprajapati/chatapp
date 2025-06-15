const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
exports.register = async (req, res) => {
    const { firstName, lastName, username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            firstName,
            lastName,
            username,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/auth/search?username=abc
exports.searchUser = async (req, res) => {
    const { username } = req.query;
    const userId = req.user.id;

    try {
        const users = await User.find({
            username: { $regex: username, $options: 'i' },
            _id: { $ne: userId }
        }).select('firstName lastName username');

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/auth/status - Update user online status
exports.updateUserStatus = async (req, res) => {
    const { isOnline } = req.body;
    const userId = req.user.id;

    try {
        const updateData = {
            isOnline,
            lastSeen: new Date()
        };

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};