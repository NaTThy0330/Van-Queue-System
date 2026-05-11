"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastDepartureAlert = void 0;
const env_1 = require("../config/env");
const socket_1 = require("../lib/socket");
const Queue_1 = require("../models/Queue");
const AppError_1 = require("../utils/AppError");
const broadcastDepartureAlert = async (req, res) => {
    try {
        console.log("[Notify] Received departure alert request");
        const secret = req.headers["x-departure-secret"];
        console.log(`[Notify] Auth check: secret from header='${secret ? "***" : "missing"}', expected='${env_1.config.departureNotifySecret ? "***" : "missing"}'
`);
        if (env_1.config.departureNotifySecret && secret !== env_1.config.departureNotifySecret) {
            console.error("[Notify] Secret mismatch: access denied");
            throw new AppError_1.AppError("Forbidden", 403);
        }
        const tripId = req.body.trip_id || req.body.tripId;
        const title = req.body.title || "แจ้งเตือนจากคนขับ";
        const message = req.body.message || "กรุณาเตรียมตัวขึ้นรถ";
        if (!tripId) {
            console.error("[Notify] tripId is missing from request body");
            throw new AppError_1.AppError("trip_id is required", 422);
        }
        console.log(`[Notify] Processing departure alert for tripId=${tripId}`);
        const alertPayload = {
            tripId: String(tripId),
            title,
            message,
            route: req.body.route || null,
            departureTime: req.body.departure_time || req.body.departureTime || null,
        };
        console.log(`[Notify] Emitting departure:alert to trip:${tripId} room`);
        try {
            (0, socket_1.emitDepartureAlert)(alertPayload);
            console.log(`[Notify] Successfully emitted to trip room`);
        } catch (emitErr) {
            console.error(`[Notify] Error emitting to trip room:`, emitErr.message);
        }
        // Emit to each passenger room
        console.log(`[Notify] Querying passengers for trip ${tripId}...`);
        const passengers = await Queue_1.QueueModel.find({
            trip: tripId,
            status: { $ne: "cancelled" },
        }).select("passenger");
        console.log(`[Notify] Found ${passengers.length} passengers for trip ${tripId}`);
        const io = req.app.get("io");
        console.log(`[Notify] Socket.IO instance available: ${io ? "yes" : "no"}`);
        if (io) {
            const uniquePassengerIds = new Set(passengers
                .map((queue) => queue.passenger?.toString?.())
                .filter(Boolean));
            console.log(`[Notify] Unique passenger recipients for trip ${tripId}: ${uniquePassengerIds.size}`);
            for (const passengerId of uniquePassengerIds) {
                console.log(`[Notify] Emitting departure:alert to passenger:${passengerId}`);
                io.to(`passenger:${passengerId}`).emit("departure:alert", {
                    trip_id: String(tripId),
                    title,
                    message,
                    route: req.body.route || null,
                    departure_time: req.body.departure_time || req.body.departureTime || null,
                });
            }
            console.log(`[Notify] Completed emitting to all passenger rooms`);
        }
        console.log(`[Notify] Departure alert broadcast for trip ${tripId} completed`);
        res.json({ success: true });
    } catch (error) {
        console.error(`[Notify] Error in broadcastDepartureAlert:`, error.message);
        console.error("[Notify] Stack:", error.stack);
        if (error.message === "Forbidden") {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }
        res.status(500).json({ success: false, error: error.message || "Internal server error" });
    }
};
//# sourceMappingURL=notificationsController.js.map
