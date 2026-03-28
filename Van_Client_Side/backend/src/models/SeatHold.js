"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatHoldModel = void 0;
const mongoose_1 = require("mongoose");
const seatHoldSchema = new mongoose_1.Schema({
    passenger: { type: mongoose_1.Schema.Types.ObjectId, ref: "Passenger", required: true },
    trip: { type: mongoose_1.Schema.Types.ObjectId, ref: "Trip", required: true },
    seatCount: { type: Number, required: true, min: 1 },
    expiresAt: { type: Date, required: true, index: { expires: "0s" } },
    released: { type: Boolean, default: false },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
seatHoldSchema.index({ passenger: 1, trip: 1, released: 1 });
exports.SeatHoldModel = (0, mongoose_1.model)("SeatHold", seatHoldSchema);
//# sourceMappingURL=SeatHold.js.map