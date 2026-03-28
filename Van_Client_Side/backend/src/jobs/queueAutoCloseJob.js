"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startQueueAutoCloseJob = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Queue_1 = require("../models/Queue");
const Trip_1 = require("../models/Trip");
const Passenger_1 = require("../models/Passenger");
const socket_1 = require("../lib/socket");
const notificationService_1 = require("../services/notificationService");
const LIMIT = 50;
const startQueueAutoCloseJob = () => {
    const tick = async () => {
        try {
            const now = new Date();
            const expiringQueues = await Queue_1.QueueModel.find({
                status: "pending",
                autoExpireAt: { $lt: now },
            }).limit(LIMIT);
            await Promise.all(expiringQueues.map(async (queue) => {
                const session = await mongoose_1.default.startSession();
                try {
                    const updatedQueue = await session.withTransaction(async () => {
                        const queueDoc = await Queue_1.QueueModel.findById(queue._id).session(session);
                        if (!queueDoc || queueDoc.status !== "pending")
                            return null;
                        if (!queueDoc.autoExpireAt || queueDoc.autoExpireAt.getTime() > Date.now())
                            return null;
                        const trip = await Trip_1.TripModel.findById(queueDoc.trip).session(session);
                        if (trip) {
                            trip.onlineBookedSeats = Math.max(trip.onlineBookedSeats - queueDoc.seatCount, 0);
                            await trip.save({ session });
                        }
                        queueDoc.status = queueDoc.queueType === "online_paid" ? "no_show" : "expired";
                        await queueDoc.save({ session });
                        return queueDoc;
                    });
                    if (!updatedQueue)
                        return;
                    await (0, socket_1.emitTripAvailability)(updatedQueue.trip.toString());
                    (0, socket_1.emitQueueUpdate)({
                        queueId: updatedQueue._id.toString(),
                        status: updatedQueue.status,
                        passengerId: updatedQueue.passenger.toString(),
                    });
                    const passenger = await Passenger_1.PassengerModel.findById(updatedQueue.passenger);
                    if (passenger) {
                        await (0, notificationService_1.sendPushNotification)(passenger, {
                            title: "Booking expired",
                            body: updatedQueue.status === "expired"
                                ? "Waitlist hold expired and seats were released."
                                : "Paid booking marked as no-show.",
                            data: { queueId: updatedQueue._id.toString() },
                        });
                    }
                }
                finally {
                    await session.endSession();
                }
            }));
        }
        catch (error) {
            console.error("Queue auto close job failed", error);
        }
    };
    tick();
    return setInterval(tick, 30 * 1000);
};
exports.startQueueAutoCloseJob = startQueueAutoCloseJob;
//# sourceMappingURL=queueAutoCloseJob.js.map