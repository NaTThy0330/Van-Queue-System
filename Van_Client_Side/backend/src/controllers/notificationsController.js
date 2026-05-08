"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastDepartureAlert = void 0;
const env_1 = require("../config/env");
const socket_1 = require("../lib/socket");
const AppError_1 = require("../utils/AppError");
const broadcastDepartureAlert = async (req, res) => {
    const secret = req.headers["x-departure-secret"];
    if (env_1.config.departureNotifySecret && secret !== env_1.config.departureNotifySecret) {
        throw new AppError_1.AppError("Forbidden", 403);
    }
    const tripId = req.body.trip_id || req.body.tripId;
    const title = req.body.title || "แจ้งเตือนจากคนขับ";
    const message = req.body.message || "กรุณาเตรียมตัวขึ้นรถ";
    if (!tripId) {
        throw new AppError_1.AppError("trip_id is required", 422);
    }
    // Emit to trip room (passengers who booked this trip)
    (0, socket_1.emitDepartureAlert)({
        tripId: String(tripId),
        title,
        message,
        route: req.body.route || null,
        departureTime: req.body.departure_time || req.body.departureTime || null,
    });
    console.log(`[Notify] Departure alert broadcast for trip ${tripId}`);
    res.json({ success: true });
};
exports.broadcastDepartureAlert = broadcastDepartureAlert;
//# sourceMappingURL=notificationsController.js.map
