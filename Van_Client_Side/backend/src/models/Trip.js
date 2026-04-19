"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripModel = void 0;
const mongoose_1 = require("mongoose");
const tripSchema = new mongoose_1.Schema({
    vanId: { type: String, trim: true },
    vanRef: { type: mongoose_1.Schema.Types.ObjectId, ref: "Van" },
    route: { type: mongoose_1.Schema.Types.ObjectId, ref: "Route", required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date },
    actualDepartureTime: { type: Date },
    status: {
        type: String,
        enum: ["scheduled", "departed", "completed", "cancelled"],
        default: "scheduled",
    },
    seatCapacity: { type: Number, required: true, min: 1 },
    onlineQuota: { type: Number, required: true, min: 0 },
    walkinQuota: { type: Number, required: true, min: 0 },
    availableSeats: { type: Number, default: function () { return this.seatCapacity; }, min: 0 },
    onlineHeldSeats: { type: Number, default: 0 },
    onlineBookedSeats: { type: Number, default: 0 },
    driverId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Driver" },
    cutoffTime: { type: Date },
    completedAt: { type: Date },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
tripSchema.pre("validate", function preValidate() {
    if (this.isModified("seatCapacity")) {
        const half = Math.floor(this.seatCapacity / 2);
        this.onlineQuota = half;
        this.walkinQuota = this.seatCapacity - half;
    }
});
tripSchema.methods.computeOnlineRemaining = function computeOnlineRemaining() {
    return Math.max(this.onlineQuota - this.onlineHeldSeats - this.onlineBookedSeats, 0);
};
exports.TripModel = (0, mongoose_1.model)("Trip", tripSchema);
//# sourceMappingURL=Trip.js.map
