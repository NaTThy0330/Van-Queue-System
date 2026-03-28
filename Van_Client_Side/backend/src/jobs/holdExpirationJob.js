"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSeatHoldExpirationJob = void 0;
const SeatHold_1 = require("../models/SeatHold");
const seatHoldService_1 = require("../services/seatHoldService");
const socket_1 = require("../lib/socket");
const startSeatHoldExpirationJob = () => {
    const tick = async () => {
        try {
            const expiredHolds = await SeatHold_1.SeatHoldModel.find({
                expiresAt: { $lt: new Date() },
                released: false,
            })
                .limit(100)
                .lean();
            const affectedTrips = new Set();
            await Promise.all(expiredHolds.map(async (hold) => {
                await (0, seatHoldService_1.releaseSeatHold)(hold._id.toString());
                affectedTrips.add(String(hold.trip));
            }));
            await Promise.all(Array.from(affectedTrips).map((tripId) => (0, socket_1.emitTripAvailability)(tripId)));
        }
        catch (error) {
            console.error("Seat hold expiration job failed", error);
        }
    };
    tick();
    return setInterval(tick, 30 * 1000);
};
exports.startSeatHoldExpirationJob = startSeatHoldExpirationJob;
//# sourceMappingURL=holdExpirationJob.js.map