const mongoose = require('mongoose');

const ticketHistorySchema = new mongoose.Schema({
    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passenger',
        required: true
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    queue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Queue',
        required: true,
        unique: true
    },
    ticketCode: { type: String },
    issuedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: false });

ticketHistorySchema.index({ passenger: 1, trip: 1 }, { unique: true });
ticketHistorySchema.index({ issuedAt: 1 });

ticketHistorySchema.virtual('passenger_id').get(function () { return this.passenger; });
ticketHistorySchema.virtual('trip_id').get(function () { return this.trip; });
ticketHistorySchema.virtual('queue_id').get(function () { return this.queue; });
ticketHistorySchema.virtual('issued_at').get(function () { return this.issuedAt; });

ticketHistorySchema.set('toJSON', { virtuals: true });
ticketHistorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TicketHistory', ticketHistorySchema);
