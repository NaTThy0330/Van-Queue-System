"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTripAvailability = exports.listTrips = void 0;
const Trip_1 = require("../models/Trip");
const AppError_1 = require("../utils/AppError");
const requestValidators_1 = require("../utils/requestValidators");
const parseDateRange = (dateString) => {
    if (!dateString) {
        return undefined;
    }
    // Parse YYYY-MM-DD as Bangkok midnight boundaries (UTC+7)
    const parts = dateString.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        // Fallback: try as ISO date
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            throw new AppError_1.AppError("Invalid date parameter", 400);
        }
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return { $gte: start, $lt: end };
    }
    const [y, m, d] = parts;
    // Bangkok 00:00 = UTC 17:00 previous day (UTC+7)
    const start = new Date(Date.UTC(y, m - 1, d, -7, 0, 0));
    const end = new Date(Date.UTC(y, m - 1, d + 1, -7, 0, 0));
    return { $gte: start, $lt: end };
};
const listTrips = async (req, res) => {
    const routeId = typeof req.query.route_id === "string" ? req.query.route_id : undefined;
    const date = typeof req.query.date === "string" ? req.query.date : undefined;
    const statusParam = typeof req.query.status === "string" ? req.query.status : "scheduled";
    const filter = {};
    if (routeId) {
        filter.route = routeId;
    }
    if (statusParam) {
        filter.status = statusParam;
    }
    // Only show trips that have a driver assigned
    filter.driverId = { $ne: null };
    const now = new Date();
    const departureRange = date ? parseDateRange(date) : { $gt: now };
    if (departureRange.$gte && departureRange.$gte < now) {
        departureRange.$gte = now;
    }

    const regularTripsFilter = {
        ...filter,
        departureTime: departureRange,
        isSpecialRound: { $ne: true },
    };
    const specialTripsFilter = {
        ...filter,
        isSpecialRound: true,
    };

    const trips = await Trip_1.TripModel.find({
        $or: [regularTripsFilter, specialTripsFilter]
    }).populate("route").sort({ departureTime: 1 });
    res.json({ trips });
};
exports.listTrips = listTrips;
const getTripAvailability = async (req, res) => {
    const tripId = (0, requestValidators_1.requireString)(req.params.tripId, "tripId");
    const trip = await Trip_1.TripModel.findById(tripId);
    if (!trip) {
        throw new AppError_1.AppError("Trip not found", 404);
    }
    const onlineRemaining = trip.computeOnlineRemaining();
    res.json({
        trip: {
            id: trip._id.toString(),
            status: trip.status,
            onlineQuota: trip.onlineQuota,
            walkinQuota: trip.walkinQuota,
            onlineRemaining,
            isFull: trip.status !== "scheduled" || onlineRemaining <= 0,
        },
    });
};
exports.getTripAvailability = getTripAvailability;
//# sourceMappingURL=tripsController.js.map
