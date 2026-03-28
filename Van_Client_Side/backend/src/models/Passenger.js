"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassengerModel = void 0;
const mongoose_1 = require("mongoose");
const passengerSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fcmTokens: { type: [String], default: [] },
    isAnonymous: { type: Boolean, default: false },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
exports.PassengerModel = (0, mongoose_1.model)("Passenger", passengerSchema);
//# sourceMappingURL=Passenger.js.map
