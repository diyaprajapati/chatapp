const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    username: { type: String, require: true, unique: true },
    avatar: { type: String, default: '' },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    password: { type: String, require: true },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema);