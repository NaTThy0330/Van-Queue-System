const mongoose = require('mongoose');

const locationUpdateSchema = new mongoose.Schema({
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },
    lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

locationUpdateSchema.index({ trip: 1 });
locationUpdateSchema.index({ timestamp: 1 });
locationUpdateSchema.index({ trip: 1, timestamp: 1 });

locationUpdateSchema.virtual('trip_id').get(function () { return this.trip; });
locationUpdateSchema.virtual('latitude').get(function () { return this.lat; });
locationUpdateSchema.virtual('longitude').get(function () { return this.lng; });

locationUpdateSchema.set('toJSON', { virtuals: true });
locationUpdateSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LocationUpdate', locationUpdateSchema);
