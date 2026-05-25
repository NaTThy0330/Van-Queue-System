"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitPaymentUpdate = exports.emitQueueUpdate = exports.emitDepartureAlert = exports.emitTripAvailability = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const Trip_1 = require("../models/Trip");
let io = null;
const tripRoom = (tripId) => `trip:${tripId}`;
const passengerRoom = (passengerId) => `passenger:${passengerId}`;
const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: { origin: allowedOrigins.length > 0 ? allowedOrigins : "*" },
        transports: ["websocket", "polling"],
    });
    io.on("connection", (socket) => {
        socket.on("join:trip", (tripId) => {
            if (tripId) {
                socket.join(tripRoom(tripId));
                console.log(`[Socket] join trip room ${tripRoom(tripId)} (${socket.id})`);
            }
        });
        socket.on("leave:trip", (tripId) => socket.leave(tripRoom(tripId)));
        socket.on("join:passenger", (passengerId) => {
            if (passengerId) {
                socket.join(passengerRoom(passengerId));
                console.log(`[Socket] join passenger room ${passengerRoom(passengerId)} (${socket.id})`);
            }
        });
        socket.on("leave:passenger", (passengerId) => socket.leave(passengerRoom(passengerId)));
    });
    return io;
};
exports.initSocket = initSocket;
const ensureIO = () => {
    if (!io) {
        throw new Error("Socket server not initialized");
    }
    return io;
};
const emitTripAvailability = async (tripId) => {
    const trip = await Trip_1.TripModel.findById(tripId);
    if (!trip)
        return;
    ensureIO().to(tripRoom(tripId)).emit("trip:availability", {
        tripId,
        onlineRemaining: trip.computeOnlineRemaining(),
    });
};
exports.emitTripAvailability = emitTripAvailability;
const emitDepartureAlert = (payload) => {
    const alertData = {
        trip_id: payload.tripId,
        title: payload.title,
        message: payload.message,
        route: payload.route || null,
        departure_time: payload.departureTime || null,
    };
    const server = ensureIO();
    // Emit to trip room (passengers who booked this trip)
    console.log(`[Socket] emit departure alert to ${tripRoom(payload.tripId)}`);
    server.to(tripRoom(payload.tripId)).emit("departure:alert", alertData);
};
exports.emitDepartureAlert = emitDepartureAlert;
const emitQueueUpdate = (payload) => ensureIO().to(passengerRoom(payload.passengerId)).emit("queue:updated", payload);
exports.emitQueueUpdate = emitQueueUpdate;
const emitPaymentUpdate = (payload) => ensureIO().to(passengerRoom(payload.passengerId)).emit("payment:updated", payload);
exports.emitPaymentUpdate = emitPaymentUpdate;
//# sourceMappingURL=socket.js.map
