const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passenger',
        required: false
    },
    passengerName: {
        type: String,
        required: false
    },
    seatCount: {
        type: Number,
        default: 1
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    queueType: {
        type: String,
        enum: ['online_paid', 'online_unpaid', 'walkin'],
        required: true
    },
    bookingSource: {
        type: String,
        enum: ['online', 'walkin'],
        default: 'online'
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid'
    },
    priorityLevel: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked_in', 'acknowledged', 'cancelled', 'expired', 'no_show'],
        default: 'pending'
    },
    ticketCode: { type: String },
    autoExpireAt: { type: Date },
    checkInTime: { type: Date },
    cancelReason: { type: String }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

queueSchema.index({ trip: 1, passenger: 1 }, { sparse: true });
queueSchema.index({ status: 1 });
queueSchema.index({ trip: 1, status: 1 });

queueSchema.virtual('passenger_id').get(function () { return this.passenger; });
queueSchema.virtual('passenger_name').get(function () { return this.passengerName; });
queueSchema.virtual('seat_count').get(function () { return this.seatCount; });
queueSchema.virtual('trip_id').get(function () { return this.trip; });
queueSchema.virtual('queue_type').get(function () { return this.queueType; });
queueSchema.virtual('booking_source').get(function () { return this.bookingSource; });
queueSchema.virtual('payment_status').get(function () { return this.paymentStatus; });
queueSchema.virtual('priority_level').get(function () { return this.priorityLevel; });
queueSchema.virtual('created_at').get(function () { return this.createdAt; });
queueSchema.virtual('check_in_time').get(function () { return this.checkInTime; });
queueSchema.virtual('cancel_reason').get(function () { return this.cancelReason; });
queueSchema.virtual('ticket_code').get(function () { return this.ticketCode; });

queueSchema.set('toJSON', { virtuals: true });
queueSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Queue', queueSchema);
