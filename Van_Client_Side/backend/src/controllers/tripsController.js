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
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        throw new AppError_1.AppError("Invalid date parameter", 400);
    }
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { $gte: start, $lt: end };
};
const listTrips = async (req, res) => {
    const routeId = typeof req.query.route_id === "string" ? req.query.route_id : undefined;
    const date = typeof req.query.date === "string" ? req.query.date : undefined;
    const statusParam = typeof req.query.status === "string" ? req.query.status : "scheduled";
    const includeUnassigned = req.query.include_unassigned === "true" || req.query.include_unassigned === "1";
    const filter = {};
    if (routeId) {
        filter.route = routeId;
    }
    if (statusParam) {
        filter.status = statusParam;
    }
    if (!includeUnassigned) {
        filter.driverId = { $ne: null };
    }
    if (date) {
        filter.departureTime = parseDateRange(date);
    }
    const trips = await Trip_1.TripModel.find(filter).populate("route").sort({ departureTime: 1 });
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
