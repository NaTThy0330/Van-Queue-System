const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, sparse: true, unique: true },
    password_hash: { type: String, default: null },
    role: {
        type: String,
        enum: ['driver', 'passenger'],
        default: 'passenger'
    },
    license_no: { type: String, sparse: true, unique: true },
    vanNumber: { type: String, default: null },
    fcmToken: { type: String, default: null },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
