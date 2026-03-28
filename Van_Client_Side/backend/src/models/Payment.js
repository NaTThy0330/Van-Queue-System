"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModel = void 0;
const mongoose_1 = require("mongoose");
const paymentSchema = new mongoose_1.Schema({
    queue: { type: mongoose_1.Schema.Types.ObjectId, ref: "Queue", required: true, unique: true },
    amount: { type: Number },
    slipUrl: { type: String },
    status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
    },
    verifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Driver" },
    verifiedAt: { type: Date },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
exports.PaymentModel = (0, mongoose_1.model)("Payment", paymentSchema);
//# sourceMappingURL=Payment.js.map
