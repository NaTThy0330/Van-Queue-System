"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const resolvedMongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const requireValue = (value, name) => {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value.trim();
};
const baseConfig = {
    port: Number(process.env.PORT || 4000),
    mongoUri: requireValue(resolvedMongoUri, "MONGO_URI"),
    jwtSecret: requireValue(process.env.JWT_SECRET, "JWT_SECRET"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
    seatHoldSeconds: Number(process.env.SEAT_HOLD_SECONDS || 180),
    unpaidCutoffMinutes: Number(process.env.UNPAID_CUTOFF_MINUTES || 10),
    paidLateMinutes: Number(process.env.PAID_LATE_MINUTES || 5),
    uploadDir: process.env.UPLOAD_DIR || path_1.default.join(process.cwd(), "uploads"),
    departureNotifySecret: process.env.DEPARTURE_NOTIFY_SECRET || "",
};
if (process.env.FCM_SERVER_KEY) {
    baseConfig.fcmServerKey = process.env.FCM_SERVER_KEY;
}
exports.config = baseConfig;
//# sourceMappingURL=env.js.map
