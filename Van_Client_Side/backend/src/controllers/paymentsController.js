"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentByQueue = exports.uploadPaymentSlip = void 0;
const path_1 = __importDefault(require("path"));
const Queue_1 = require("../models/Queue");
const Payment_1 = require("../models/Payment");
const AppError_1 = require("../utils/AppError");
const socket_1 = require("../lib/socket");
const requestValidators_1 = require("../utils/requestValidators");
const buildSlipPath = (filename) => {
    if (!filename)
        return undefined;
    return path_1.default.posix.join("/uploads", filename);
};
const uploadPaymentSlip = async (req, res) => {
    if (!req.passenger)
        throw new AppError_1.AppError("Unauthorized", 401);
    const queueId = (0, requestValidators_1.requireString)(req.params.queueId, "queueId");
    const queue = await Queue_1.QueueModel.findOne({ _id: queueId, passenger: req.passenger._id });
    if (!queue)
        throw new AppError_1.AppError("Queue not found", 404);
    if (queue.queueType !== "online_paid") {
        if (queue.queueType === "online_unpaid") {
            queue.queueType = "online_paid";
            await queue.save();
        }
        else {
            throw new AppError_1.AppError("Payments allowed only for online_paid bookings", 400);
        }
    }
    const slipUrl = buildSlipPath(req.file?.filename);
    if (!slipUrl)
        throw new AppError_1.AppError("Payment slip file is required", 422);
    const payment = await Payment_1.PaymentModel.findOneAndUpdate({ queue: queue._id }, { slipUrl, status: "pending" }, { upsert: true, new: true, setDefaultsOnInsert: true });
    if (!payment) {
        throw new AppError_1.AppError("Unable to store payment", 500);
    }
    (0, socket_1.emitPaymentUpdate)({
        queueId: queue._id.toString(),
        status: payment.status,
        passengerId: req.passenger._id.toString(),
    });
    res.status(201).json({ payment });
};
exports.uploadPaymentSlip = uploadPaymentSlip;
const getPaymentByQueue = async (req, res) => {
    if (!req.passenger)
        throw new AppError_1.AppError("Unauthorized", 401);
    const queueId = (0, requestValidators_1.requireString)(req.params.queueId, "queueId");
    const queue = await Queue_1.QueueModel.findOne({ _id: queueId, passenger: req.passenger._id });
    if (!queue)
        throw new AppError_1.AppError("Queue not found", 404);
    const payment = await Payment_1.PaymentModel.findOne({ queue: queue._id });
    res.json({ payment });
};
exports.getPaymentByQueue = getPaymentByQueue;
//# sourceMappingURL=paymentsController.js.map
