"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitSeatHold = exports.releaseSeatHold = exports.createSeatHold = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const SeatHold_1 = require("../models/SeatHold");
const Trip_1 = require("../models/Trip");
const Queue_1 = require("../models/Queue");
const AppError_1 = require("../utils/AppError");
const withSession = async (callback) => {
    const session = await mongoose_1.default.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            result = await callback(session);
        });
        if (typeof result === "undefined") {
            throw new AppError_1.AppError("Transaction failed to produce a result", 500);
        }
        return result;
    }
    finally {
        await session.endSession();
    }
};
const createSeatHold = async (params) => {
    const { passengerId, tripId, seatCount } = params;
    const existingHold = await SeatHold_1.SeatHoldModel.findOne({
        passenger: passengerId,
        trip: tripId,
        released: false,
        expiresAt: { $gt: new Date() },
    });
    if (existingHold) {
        throw new AppError_1.AppError("Active hold already exists for this trip", 409);
    }
    return withSession(async (session) => {
        const trip = await Trip_1.TripModel.findById(tripId).session(session);
        if (!trip) {
            throw new AppError_1.AppError("Trip not found", 404);
        }
        if (trip.status !== "scheduled") {
            throw new AppError_1.AppError("Trip is not open for booking", 400);
        }
        const remaining = trip.computeOnlineRemaining();
        if (remaining < seatCount) {
            throw new AppError_1.AppError("Not enough seats remaining", 409, { remaining });
        }
        trip.onlineHeldSeats += seatCount;
        await trip.save({ session });
        const expiresAt = new Date(Date.now() + env_1.config.seatHoldSeconds * 1000);
        const [hold] = await SeatHold_1.SeatHoldModel.create([{ passenger: passengerId, trip: tripId, seatCount, expiresAt }], { session });
        return hold;
    });
};
exports.createSeatHold = createSeatHold;
const releaseSeatHold = async (holdId) => {
    const hold = await SeatHold_1.SeatHoldModel.findById(holdId);
    if (!hold || hold.released) {
        return null;
    }
    await withSession(async (session) => {
        const trip = await Trip_1.TripModel.findById(hold.trip).session(session);
        if (trip) {
            trip.onlineHeldSeats = Math.max(trip.onlineHeldSeats - hold.seatCount, 0);
            await trip.save({ session });
        }
        hold.released = true;
        await hold.save({ session });
        return null;
    });
    return hold;
};
exports.releaseSeatHold = releaseSeatHold;
const commitSeatHold = async (params) => {
    const { holdId, passengerId, queueType } = params;
    return withSession(async (session) => {
        const hold = await SeatHold_1.SeatHoldModel.findOne({
            _id: holdId,
            passenger: passengerId,
            released: false,
        }).session(session);
        if (!hold) {
            throw new AppError_1.AppError("Hold not found or already released", 404);
        }
        if (hold.expiresAt.getTime() < Date.now()) {
            throw new AppError_1.AppError("Hold already expired", 410);
        }
        const trip = await Trip_1.TripModel.findById(hold.trip).session(session);
        if (!trip) {
            throw new AppError_1.AppError("Trip not found", 404);
        }
        if (trip.status !== "scheduled") {
            throw new AppError_1.AppError("Trip is not open for booking", 400);
        }
        trip.onlineHeldSeats = Math.max(trip.onlineHeldSeats - hold.seatCount, 0);
        trip.onlineBookedSeats += hold.seatCount;
        await trip.save({ session });
        const cutoffMinutes = queueType === "online_unpaid" ? env_1.config.unpaidCutoffMinutes : env_1.config.paidLateMinutes;
        const autoExpireAt = new Date(Date.now() + cutoffMinutes * 60 * 1000);
        const [queueDoc] = await Queue_1.QueueModel.create([
            {
                passenger: passengerId,
                trip: trip._id,
                queueType,
                seatCount: hold.seatCount,
                status: "pending",
                autoExpireAt,
            },
        ], { session });
        hold.released = true;
        await hold.save({ session });
        return queueDoc;
    });
};
exports.commitSeatHold = commitSeatHold;
//# sourceMappingURL=seatHoldService.js.map