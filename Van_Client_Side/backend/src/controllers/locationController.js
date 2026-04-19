"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.latestTripLocation = void 0;
const LocationUpdate_1 = require("../models/LocationUpdate");
const AppError_1 = require("../utils/AppError");
const requestValidators_1 = require("../utils/requestValidators");
const latestTripLocation = async (req, res) => {
    const tripId = (0, requestValidators_1.requireString)(req.params.tripId, "tripId");
    const update = await LocationUpdate_1.LocationUpdateModel.findOne({ trip: tripId })
        .sort({ timestamp: -1 })
        .lean();
    if (!update) {
        throw new AppError_1.AppError("No location data available", 404);
    }
    res.json({ location: update });
};
exports.latestTripLocation = latestTripLocation;
//# sourceMappingURL=locationController.js.map