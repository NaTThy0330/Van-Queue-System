"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.syncTripFromDriver = void 0;

const mongoose = require("mongoose");
const { config } = require("../config/env");
const { AppError } = require("../utils/AppError");
const { TripModel } = require("../models/Trip");
const { RouteModel } = require("../models/Route");
const { emitTripAvailability } = require("../lib/socket");

const getHeaderSecret = (req) => req.headers["x-departure-secret"];

const toObjectIdString = (value) => {
    if (!value) {
        return null;
    }
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "object" && value._id) {
        return value._id.toString();
    }
    return typeof value.toString === "function" ? value.toString() : null;
};

const parseNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveRoute = async (payload) => {
    const routePayload = payload.route && typeof payload.route === "object" ? payload.route : null;
    const routeId = payload.route_id ||
        payload.routeId ||
        payload.route_id_string ||
        routePayload?._id ||
        routePayload?.id ||
        (typeof payload.route === "string" ? payload.route : null);

    if (routeId && mongoose.isValidObjectId(routeId)) {
        const byId = await RouteModel.findById(routeId);
        if (byId) {
            return byId;
        }
    }

    const routeCode = routePayload?.routeCode || routePayload?.route_code || payload.route_code || payload.routeCode || null;
    if (routeCode) {
        const byCode = await RouteModel.findOne({ routeCode });
        if (byCode) {
            return byCode;
        }
    }

    const origin = routePayload?.origin || payload.origin || null;
    const destination = routePayload?.destination || payload.destination || null;
    if (origin && destination) {
        const byPath = await RouteModel.findOne({ origin, destination });
        if (byPath) {
            return byPath;
        }

        const routeDoc = new RouteModel({
            routeCode,
            routeName: routePayload?.routeName || routePayload?.route_name || payload.routeName || payload.route_name || null,
            origin,
            destination,
            distance: parseNumber(routePayload?.distance ?? payload.distance, 0),
            durationMinutes: parseNumber(routePayload?.durationMinutes ?? routePayload?.duration_minutes ?? payload.durationMinutes ?? payload.duration_minutes, 60),
            destinationLat: parseNumber(routePayload?.destinationLat ?? routePayload?.destination_lat ?? payload.destinationLat ?? payload.destination_lat, 0),
            destinationLng: parseNumber(routePayload?.destinationLng ?? routePayload?.destination_lng ?? payload.destinationLng ?? payload.destination_lng, 0),
        });
        await routeDoc.save();
        return routeDoc;
    }

    throw new AppError("Route not found", 404);
};

const buildTripUpdate = (payload, routeId) => {
    const seatCapacity = parseNumber(payload.seat_capacity ?? payload.seatCapacity, 13);
    const onlineQuota = parseNumber(payload.online_quota ?? payload.onlineQuota, Math.floor(seatCapacity / 2));
    const walkinQuota = parseNumber(payload.walkin_quota ?? payload.walkinQuota, seatCapacity - onlineQuota);

    return {
        route: routeId,
        departureTime: payload.departure_time || payload.departureTime,
        arrivalTime: payload.arrival_time ?? payload.arrivalTime ?? null,
        actualDepartureTime: payload.actual_departure_time ?? payload.actualDepartureTime ?? null,
        isSpecialRound: Boolean(payload.is_special_round ?? payload.isSpecialRound ?? false),
        status: payload.status || "scheduled",
        seatCapacity,
        onlineQuota,
        walkinQuota,
        availableSeats: parseNumber(payload.available_seats ?? payload.availableSeats, seatCapacity),
        onlineHeldSeats: parseNumber(payload.online_held_seats ?? payload.onlineHeldSeats, 0),
        onlineBookedSeats: parseNumber(payload.online_booked_seats ?? payload.onlineBookedSeats, 0),
        driverId: toObjectIdString(payload.driver_id ?? payload.driverId),
        vanId: payload.van_id ?? payload.vanId ?? null,
        vanRef: toObjectIdString(payload.van_ref ?? payload.vanRef),
        cutoffTime: payload.cutoff_time ?? payload.cutoffTime ?? null,
        completedAt: payload.completed_at ?? payload.completedAt ?? null,
    };
};

const syncTripFromDriver = async (req, res) => {
    const secret = getHeaderSecret(req);
    if (config.departureNotifySecret && secret !== config.departureNotifySecret) {
        throw new AppError("Forbidden", 403);
    }

    const tripId = req.body.trip_id || req.body.tripId || req.body._id || req.body.id;
    if (!tripId) {
        throw new AppError("trip_id is required", 422);
    }

    const departureTime = req.body.departure_time || req.body.departureTime;
    if (!departureTime) {
        throw new AppError("departure_time is required", 422);
    }

    const route = await resolveRoute(req.body);
    const update = buildTripUpdate(req.body, route._id);

    let trip = await TripModel.findById(tripId);
    if (trip) {
        trip.set(update);
        await trip.save();
    } else {
        trip = new TripModel({
            _id: tripId,
            ...update,
        });
        await trip.save();
    }

    trip = await TripModel.findById(tripId).populate("route");

    if (trip) {
        try {
            await emitTripAvailability(trip._id.toString());
        } catch (emitError) {
            console.warn("[Trip Sync] emitTripAvailability failed:", emitError.message);
        }
    }

    console.log(`[Trip Sync] Upserted trip ${tripId}`);
    res.json({ success: true, trip });
};

exports.syncTripFromDriver = syncTripFromDriver;
