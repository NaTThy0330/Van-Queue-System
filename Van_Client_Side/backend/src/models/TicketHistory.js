"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketHistoryModel = void 0;
const mongoose_1 = require("mongoose");
const ticketHistorySchema = new mongoose_1.Schema({
    passenger: { type: mongoose_1.Schema.Types.ObjectId, ref: "Passenger", required: true },
    trip: { type: mongoose_1.Schema.Types.ObjectId, ref: "Trip", required: true },
    queue: { type: mongoose_1.Schema.Types.ObjectId, ref: "Queue", required: true },
    ticketCode: { type: String, required: true },
    issuedAt: { type: Date, required: true },
}, { timestamps: false });
ticketHistorySchema.index({ passenger: 1, trip: 1, queue: 1 }, { unique: true });
exports.TicketHistoryModel = (0, mongoose_1.model)("TicketHistory", ticketHistorySchema);
//# sourceMappingURL=TicketHistory.js.map