"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModel = void 0;
const mongoose_1 = require("mongoose");
const queueSchema = new mongoose_1.Schema({
    passenger: { type: mongoose_1.Schema.Types.ObjectId, ref: "Passenger", required: true },
    trip: { type: mongoose_1.Schema.Types.ObjectId, ref: "Trip", required: true },
    queueType: {
        type: String,
        enum: ["online_paid", "online_unpaid", "walkin"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "checked_in", "acknowledged", "cancelled", "expired", "no_show"],
        default: "pending",
    },
    seatCount: { type: Number, required: true, min: 1 },
    ticketCode: { type: String },
    autoExpireAt: { type: Date },
    passengerName: { type: String },
    bookingSource: { type: String, enum: ["online", "walkin"], default: "online" },
    paymentStatus: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    priorityLevel: { type: Number, default: 0 },
    checkInTime: { type: Date },
    cancelReason: { type: String },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
queueSchema.index({ passenger: 1, trip: 1, queueType: 1 });
exports.QueueModel = (0, mongoose_1.model)("Queue", queueSchema);
//# sourceMappingURL=Queue.js.map
