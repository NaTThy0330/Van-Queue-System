"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastDepartureAlert = void 0;
const env_1 = require("../config/env");
const socket_1 = require("../lib/socket");
const Queue_1 = require("../models/Queue");
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
    const alertPayload = {
        tripId: String(tripId),
        title,
        message,
        route: req.body.route || null,
        departureTime: req.body.departure_time || req.body.departureTime || null,
    };
    // Emit to trip room for backward compatibility
    (0, socket_1.emitDepartureAlert)(alertPayload);
    // Emit to each passenger room so the notification does not depend on trip-room joins
    const passengers = await Queue_1.QueueModel.find({
        trip: tripId,
        status: { $ne: "cancelled" },
    }).select("passenger");
    const io = req.app.get("io");
    if (io) {
        const uniquePassengerIds = new Set(passengers
            .map((queue) => queue.passenger?.toString?.())
            .filter(Boolean));
        console.log(`[Notify] passenger recipients for trip ${tripId}: ${uniquePassengerIds.size}`);
        for (const passengerId of uniquePassengerIds) {
            console.log(`[Notify] emit departure alert to passenger:${passengerId}`);
            io.to(`passenger:${passengerId}`).emit("departure:alert", {
                trip_id: String(tripId),
                title,
                message,
                route: req.body.route || null,
                departure_time: req.body.departure_time || req.body.departureTime || null,
            });
        }
    }
    console.log(`[Notify] Departure alert broadcast for trip ${tripId}`);
    res.json({ success: true });
};
exports.broadcastDepartureAlert = broadcastDepartureAlert;
//# sourceMappingURL=notificationsController.js.map
