const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    routeCode: { type: String, sparse: true },
    routeName: { type: String },
    origin: { type: String, required: true },
    destination: {
        type: String,
        required: true,
        validate: {
            validator: function (v) { return v !== this.origin; },
            message: 'Destination must be different from origin'
        }
    },
    distance: { type: Number, default: 0, min: 0 },
    durationMinutes: { type: Number, default: 60 },
    destinationLat: { type: Number, default: 0 },
    destinationLng: { type: Number, default: 0 }
});

routeSchema.index({ origin: 1, destination: 1 }, { unique: true });
routeSchema.index({ distance: 1 });

routeSchema.virtual('route_code').get(function () { return this.routeCode; });
routeSchema.virtual('route_name').get(function () { return this.routeName; });
routeSchema.virtual('duration_minutes').get(function () { return this.durationMinutes; });
routeSchema.virtual('destination_lat').get(function () { return this.destinationLat; });
routeSchema.virtual('destination_lng').get(function () { return this.destinationLng; });

routeSchema.set('toJSON', { virtuals: true });
routeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Route', routeSchema);
