const mongoose = require('mongoose');

/**
 * Booking Schema
 * Represents a passenger booking for a trip
 * 
 * Type Classification (Queue Management Theory):
 * - 'paid'    : Online booking with verified payment
 * - 'unpaid'  : Online booking pending payment
 * - 'walk-in' : On-site walk-in passenger
 */
const bookingSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    passengerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    passengerName: {
        type: String,
        required: true
    },
    passengerPhone: {
        type: String,
        required: true
    },
    seatNumber: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['paid', 'unpaid', 'walk-in'],
        default: 'unpaid'
    },
    paymentSlip: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['active', 'confirmed', 'cancelled', 'no-show', 'completed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Performance indexes for frequently queried fields
bookingSchema.index({ tripId: 1 });
bookingSchema.index({ tripId: 1, status: 1 });
bookingSchema.index({ passengerPhone: 1 });
bookingSchema.index({ type: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);

