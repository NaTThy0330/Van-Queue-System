const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    license_no: {
        type: String,
        required: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Index for fast phone lookup
driverSchema.index({ phone: 1 });

module.exports = mongoose.model('Driver', driverSchema);
