"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.post("/register", (0, asyncHandler_1.asyncHandler)(authController_1.register));
router.post("/login", (0, asyncHandler_1.asyncHandler)(authController_1.login));
router.get("/me", auth_1.authGuard, (0, asyncHandler_1.asyncHandler)(authController_1.me));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map