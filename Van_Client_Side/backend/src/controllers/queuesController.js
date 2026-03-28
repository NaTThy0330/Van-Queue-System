"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueue = exports.cancelQueue = exports.getMyQueues = void 0;
const Queue_1 = require("../models/Queue");
const Payment_1 = require("../models/Payment");
const AppError_1 = require("../utils/AppError");
const queueService_1 = require("../services/queueService");
const socket_1 = require("../lib/socket");
const notificationService_1 = require("../services/notificationService");
const requestValidators_1 = require("../utils/requestValidators");
const getMyQueues = async (req, res) => {
    if (!req.passenger)
        throw new AppError_1.AppError("Unauthorized", 401);
    const includeHistory = typeof req.query.include === "string" && req.query.include === "history";
    const payload = await (0, queueService_1.listPassengerQueues)({
        passengerId: req.passenger._id.toString(),
        includeHistory,
    });
    res.json(payload);
};
exports.getMyQueues = getMyQueues;
const cancelQueue = async (req, res) => {
    if (!req.passenger)
        throw new AppError_1.AppError("Unauthorized", 401);
    const queueId = (0, requestValidators_1.requireString)(req.params.queueId, "queueId");
    const queue = await (0, queueService_1.cancelQueue)({
        queueId,
        passengerId: req.passenger._id.toString(),
    });
    await (0, socket_1.emitTripAvailability)(queue.trip.toString());
    (0, socket_1.emitQueueUpdate)({
        queueId: queue._id.toString(),
        status: queue.status,
        passengerId: req.passenger._id.toString(),
    });
    await (0, notificationService_1.sendPushNotification)(req.passenger, {
        title: "Booking updated",
        body: "Your booking was cancelled and seats were released.",
        data: { queueId: queue._id.toString() },
    });
    res.json({ queue });
};
exports.cancelQueue = cancelQueue;
const getQueue = async (req, res) => {
    if (!req.passenger)
        throw new AppError_1.AppError("Unauthorized", 401);
    const queueId = (0, requestValidators_1.requireString)(req.params.queueId, "queueId");
    const queue = await Queue_1.QueueModel.findOne({ _id: queueId, passenger: req.passenger._id })
        .populate("trip")
        .lean();
    if (!queue)
        throw new AppError_1.AppError("Queue not found", 404);
    const payment = await Payment_1.PaymentModel.findOne({ queue: queueId }).lean();
    res.json({ queue, payment });
};
exports.getQueue = getQueue;
//# sourceMappingURL=queuesController.js.map