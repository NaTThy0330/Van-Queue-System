"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordTicketHistory = exports.listPassengerQueues = exports.cancelQueue = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Queue_1 = require("../models/Queue");
const Trip_1 = require("../models/Trip");
const TicketHistory_1 = require("../models/TicketHistory");
const AppError_1 = require("../utils/AppError");
const cancelQueue = async (params) => {
    const { queueId, passengerId } = params;
    const queue = await Queue_1.QueueModel.findOne({ _id: queueId, passenger: passengerId });
    if (!queue) {
        throw new AppError_1.AppError("Queue not found", 404);
    }
    if (!["pending", "confirmed"].includes(queue.status)) {
        throw new AppError_1.AppError("Queue cannot be cancelled", 409);
    }
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            const trip = await Trip_1.TripModel.findById(queue.trip).session(session);
            if (trip) {
                trip.onlineBookedSeats = Math.max(trip.onlineBookedSeats - queue.seatCount, 0);
                await trip.save({ session });
            }
            queue.status = "cancelled";
            await queue.save({ session });
        });
    }
    finally {
        await session.endSession();
    }
    return queue;
};
exports.cancelQueue = cancelQueue;
const listPassengerQueues = async (params) => {
    const { passengerId, includeHistory } = params;
    const queues = await Queue_1.QueueModel.find({ passenger: passengerId })
        .populate("trip")
        .sort({ createdAt: -1 });
    if (!includeHistory) {
        return { queues };
    }
    const ticketHistory = await TicketHistory_1.TicketHistoryModel.find({ passenger: passengerId })
        .populate("trip")
        .sort({ issuedAt: -1 });
    return { queues, ticketHistory };
};
exports.listPassengerQueues = listPassengerQueues;
const recordTicketHistory = async (queue) => {
    if (queue.ticketCode) {
        await TicketHistory_1.TicketHistoryModel.updateOne({ queue: queue._id }, {
            $setOnInsert: {
                passenger: queue.passenger,
                trip: queue.trip,
                ticketCode: queue.ticketCode,
                issuedAt: new Date(),
            },
        }, { upsert: true });
    }
};
exports.recordTicketHistory = recordTicketHistory;
//# sourceMappingURL=queueService.js.map