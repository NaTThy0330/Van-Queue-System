"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const Passenger_1 = require("../models/Passenger");
const AppError_1 = require("../utils/AppError");
const authGuard = async (req, _res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            throw new AppError_1.AppError("Unauthorized", 401);
        }
        const token = header.split(" ")[1];
        if (!token) {
            throw new AppError_1.AppError("Unauthorized", 401);
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        if (!decoded || typeof decoded !== "object") {
            throw new AppError_1.AppError("Unauthorized", 401);
        }
        const payload = decoded;
        if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
            throw new AppError_1.AppError("Unauthorized", 401);
        }
        const passenger = await Passenger_1.PassengerModel.findById(payload.sub);
        if (!passenger) {
            throw new AppError_1.AppError("Unauthorized", 401);
        }
        req.passenger = passenger;
        next();
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            next(error);
            return;
        }
        next(new AppError_1.AppError("Unauthorized", 401));
    }
};
exports.authGuard = authGuard;
//# sourceMappingURL=auth.js.map