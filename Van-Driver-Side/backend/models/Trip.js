const mongoose = require('mongoose');

/**
 * Trip Schema (aligned with passenger app)
 */
const tripSchema = new mongoose.Schema({
    vanId: { type: String, trim: true },
    vanRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Van', default: null },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, default: null },
    actualDepartureTime: { type: Date, default: null },
    status: {
        type: String,
        enum: ['scheduled', 'departed', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },

    seatCapacity: { type: Number, default: 13, min: 1 },
    onlineQuota: { type: Number, default: 6 },
    walkinQuota: { type: Number, default: 7 },
    availableSeats: { type: Number, default: function () { return this.seatCapacity; }, min: 0 },

    onlineHeldSeats: { type: Number, default: 0 },
    onlineBookedSeats: { type: Number, default: 0 },

    cutoffTime: { type: Date, default: null },
    completedAt: { type: Date }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

tripSchema.pre('validate', function preValidate() {
    if (this.isModified('seatCapacity')) {
        const half = Math.floor(this.seatCapacity / 2);
        this.onlineQuota = half;
        this.walkinQuota = this.seatCapacity - half;
    }
});

tripSchema.virtual('onlineRemaining').get(function () {
    const booked = Math.min(this.seatCapacity - this.availableSeats, this.onlineQuota);
    return Math.max(this.onlineQuota - booked, 0);
});

// Legacy snake_case virtuals for backward-compatible API responses
tripSchema.virtual('route_id').get(function () { return this.route; });
tripSchema.virtual('van_id').get(function () { return this.vanRef; });
tripSchema.virtual('driver_id').get(function () { return this.driverId; });
tripSchema.virtual('departure_time').get(function () { return this.departureTime; });
tripSchema.virtual('arrival_time').get(function () { return this.arrivalTime; });
tripSchema.virtual('actual_departure_time').get(function () { return this.actualDepartureTime; });
tripSchema.virtual('total_seats').get(function () { return this.seatCapacity; });
tripSchema.virtual('available_seats').get(function () { return this.availableSeats; });
tripSchema.virtual('online_quota').get(function () { return this.onlineQuota; });
tripSchema.virtual('walkin_quota').get(function () { return this.walkinQuota; });
tripSchema.virtual('online_held_seats').get(function () { return this.onlineHeldSeats; });
tripSchema.virtual('online_booked_seats').get(function () { return this.onlineBookedSeats; });
tripSchema.virtual('cutoff_time').get(function () { return this.cutoffTime; });
tripSchema.virtual('completed_at').get(function () { return this.completedAt; });

tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

tripSchema.index({ departureTime: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ departureTime: 1, status: 1 });
tripSchema.index({ driverId: 1 });
tripSchema.index({ vanRef: 1 });

module.exports = mongoose.model('Trip', tripSchema);
