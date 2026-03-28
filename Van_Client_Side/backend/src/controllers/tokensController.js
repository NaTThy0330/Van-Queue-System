"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFcmToken = void 0;
const AppError_1 = require("../utils/AppError");
const saveFcmToken = async (req, res) => {
    if (!req.passenger)
        throw new AppError_1.AppError("Unauthorized", 401);
    const { token } = req.body;
    if (!token)
        throw new AppError_1.AppError("FCM token is required", 422);
    if (!req.passenger.fcmTokens.includes(token)) {
        req.passenger.fcmTokens.push(token);
        await req.passenger.save();
    }
    res.json({ ok: true });
};
exports.saveFcmToken = saveFcmToken;
//# sourceMappingURL=tokensController.js.map