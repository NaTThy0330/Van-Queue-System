"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteModel = void 0;
const mongoose_1 = require("mongoose");
const routeSchema = new mongoose_1.Schema({
    routeCode: { type: String, sparse: true },
    routeName: { type: String },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    distance: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, default: 60 },
    destinationLat: { type: Number, default: 0 },
    destinationLng: { type: Number, default: 0 },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
routeSchema.index({ origin: 1, destination: 1 }, { unique: true });
exports.RouteModel = (0, mongoose_1.model)("Route", routeSchema);
//# sourceMappingURL=Route.js.map
