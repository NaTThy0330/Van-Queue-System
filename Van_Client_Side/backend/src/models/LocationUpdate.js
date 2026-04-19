"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationUpdateModel = void 0;
const mongoose_1 = require("mongoose");
const locationUpdateSchema = new mongoose_1.Schema({
    trip: { type: mongoose_1.Schema.Types.ObjectId, ref: "Trip", required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: () => new Date() },
});
locationUpdateSchema.index({ trip: 1, timestamp: -1 });
exports.LocationUpdateModel = (0, mongoose_1.model)("LocationUpdate", locationUpdateSchema);
//# sourceMappingURL=LocationUpdate.js.map