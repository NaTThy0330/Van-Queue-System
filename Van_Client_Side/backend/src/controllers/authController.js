"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Passenger_1 = require("../models/Passenger");
const AppError_1 = require("../utils/AppError");
const env_1 = require("../config/env");
const buildToken = (id, email) => jsonwebtoken_1.default.sign({ sub: id, email }, env_1.config.jwtSecret, { expiresIn: env_1.config.jwtExpiresIn });
const sanitizePassenger = (passenger) => {
    const payload = passenger.toObject();
    delete payload.passwordHash;
    delete payload.__v;
    return payload;
};
const register = async (req, res) => {
    const { name, phone, email, password } = req.body;
    if (!name || !email || !password) {
        throw new AppError_1.AppError("Name, email, and password are required", 422);
    }
    const existing = await Passenger_1.PassengerModel.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new AppError_1.AppError("Email already registered", 409);
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const passenger = await Passenger_1.PassengerModel.create({
        name,
        phone,
        email: email.toLowerCase(),
        passwordHash,
    });
    const token = buildToken(passenger._id.toString(), passenger.email);
    res.status(201).json({ token, passenger: sanitizePassenger(passenger) });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError_1.AppError("Email and password are required", 422);
    }
    const passenger = await Passenger_1.PassengerModel.findOne({ email: email.toLowerCase() });
    if (!passenger) {
        throw new AppError_1.AppError("Invalid credentials", 401);
    }
    const valid = await bcryptjs_1.default.compare(password, passenger.passwordHash);
    if (!valid) {
        throw new AppError_1.AppError("Invalid credentials", 401);
    }
    const token = buildToken(passenger._id.toString(), passenger.email);
    res.json({ token, passenger: sanitizePassenger(passenger) });
};
exports.login = login;
const me = async (req, res) => {
    if (!req.passenger) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    res.json({ passenger: sanitizePassenger(req.passenger) });
};
exports.me = me;
//# sourceMappingURL=authController.js.map