const mongoose = require('mongoose');

const seatHoldSchema = new mongoose.Schema({
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    seatCount: { type: Number, required: true, min: 1 },
    expiresAt: { type: Date, required: true, index: { expires: '0s' } },
    released: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

seatHoldSchema.index({ passenger: 1, trip: 1, released: 1 });

module.exports = mongoose.model('SeatHold', seatHoldSchema);
