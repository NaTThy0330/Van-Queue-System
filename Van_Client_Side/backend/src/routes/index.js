"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const protectedRoutes_1 = __importDefault(require("./protectedRoutes"));
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.json({ status: "ok" });
});
router.use("/auth", authRoutes_1.default);
router.use("/", protectedRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map