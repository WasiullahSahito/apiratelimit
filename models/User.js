const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Optional field for user-tiered limits bonus
    // plan: { type: String, enum: ['free', 'pro'], default: 'free' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);