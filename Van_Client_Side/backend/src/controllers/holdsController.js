"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMyHolds = exports.commitHold = exports.deleteHold = exports.createHold = void 0;
const env_1 = require("../config/env");
const SeatHold_1 = require("../models/SeatHold");
const AppError_1 = require("../utils/AppError");
const seatHoldService_1 = require("../services/seatHoldService");
const socket_1 = require("../lib/socket");
const notificationService_1 = require("../services/notificationService");
const requestValidators_1 = require("../utils/requestValidators");
const createHold = async (req, res) => {
    if (!req.passenger) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    const tripId = (0, requestValidators_1.requireString)(req.params.tripId, "tripId");
    const seatCountRaw = req.body.seat_count ?? req.body.seatCount;
    const normalizedSeatCount = Array.isArray(seatCountRaw) ? seatCountRaw[0] : seatCountRaw;
    const seatCount = Number(normalizedSeatCount);
    if (!seatCount || seatCount <= 0) {
        throw new AppError_1.AppError("seat_count must be greater than zero", 422);
    }
    const hold = await (0, seatHoldService_1.createSeatHold)({
        passengerId: req.passenger._id.toString(),
        tripId,
        seatCount,
    });
    await (0, socket_1.emitTripAvailability)(tripId);
    res.status(201).json({
        hold: {
            id: hold.id,
            seatCount: hold.seatCount,
            expiresAt: hold.expiresAt,
            ttlSeconds: env_1.config.seatHoldSeconds,
        },
    });
};
exports.createHold = createHold;
const deleteHold = async (req, res) => {
    const holdId = (0, requestValidators_1.requireString)(req.params.holdId, "holdId");
    const hold = await (0, seatHoldService_1.releaseSeatHold)(holdId);
    if (!hold) {
        throw new AppError_1.AppError("Hold not found", 404);
    }
    await (0, socket_1.emitTripAvailability)(hold.trip.toString());
    res.json({ released: true });
};
exports.deleteHold = deleteHold;
const commitHold = async (req, res) => {
    if (!req.passenger) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    const holdId = (0, requestValidators_1.requireString)(req.params.holdId, "holdId");
    const queueTypeValue = req.body.queue_type ?? req.body.queueType;
    const queueType = Array.isArray(queueTypeValue) ? queueTypeValue[0] : queueTypeValue;
    if (!queueType || !["online_paid", "online_unpaid"].includes(queueType)) {
        throw new AppError_1.AppError("queue_type must be online_paid or online_unpaid", 422);
    }
    const queue = await (0, seatHoldService_1.commitSeatHold)({
        holdId,
        passengerId: req.passenger._id.toString(),
        queueType,
    });
    await (0, socket_1.emitTripAvailability)(queue.trip.toString());
    (0, socket_1.emitQueueUpdate)({
        queueId: queue._id.toString(),
        status: queue.status,
        passengerId: req.passenger._id.toString(),
    });
    await (0, notificationService_1.sendPushNotification)(req.passenger, {
        title: "Reservation created",
        body: `Your ${queue.queueType.replace("_", " ")} booking is pending confirmation.`,
        data: { queueId: queue._id.toString() },
    });
    res.status(201).json({ queue });
};
exports.commitHold = commitHold;
const listMyHolds = async (req, res) => {
    if (!req.passenger)
        throw new AppError_1.AppError("Unauthorized", 401);
    const holds = await SeatHold_1.SeatHoldModel.find({
        passenger: req.passenger._id,
        released: false,
        expiresAt: { $gt: new Date() },
    }).populate("trip");
    res.json({ holds });
};
exports.listMyHolds = listMyHolds;
//# sourceMappingURL=holdsController.js.map