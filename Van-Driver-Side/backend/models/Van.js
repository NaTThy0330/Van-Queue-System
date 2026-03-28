const mongoose = require('mongoose');

const vanSchema = new mongoose.Schema({
    driver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Daily shift binding
    current_driver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    last_active_date: {
        type: String, // 'YYYY-MM-DD'
        default: null
    },
    max_rounds_per_day: {
        type: Number,
        default: 10
    },
    plate_number: {
        type: String,
        required: true,
        unique: true
    },
    model: {
        type: String,
        required: true
    },
    seat_capacity: {
        type: Number,
        required: true,
        min: 1,
        default: 13
    },
    status: {
        type: String,
        enum: ['available', 'on-duty', 'ready_for_next_trip', 'maintenance'],
        default: 'available'
    }
});

module.exports = mongoose.model('Van', vanSchema);
