"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const routesController_1 = require("../controllers/routesController");
const tripsController_1 = require("../controllers/tripsController");
const holdsController_1 = require("../controllers/holdsController");
const queuesController_1 = require("../controllers/queuesController");
const paymentsController_1 = require("../controllers/paymentsController");
const tokensController_1 = require("../controllers/tokensController");
const locationController_1 = require("../controllers/locationController");
const asyncHandler_1 = require("../utils/asyncHandler");
const env_1 = require("../config/env");
const auth_1 = require("../middleware/auth");
fs_1.default.mkdirSync(env_1.config.uploadDir, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, env_1.config.uploadDir),
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${timestamp}_${safeName}`);
    },
});
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router.use(auth_1.authGuard);
router.get("/routes", (0, asyncHandler_1.asyncHandler)(routesController_1.listRoutes));
router.get("/trips", (0, asyncHandler_1.asyncHandler)(tripsController_1.listTrips));
router.get("/trips/:tripId/availability", (0, asyncHandler_1.asyncHandler)(tripsController_1.getTripAvailability));
router.get("/trips/:tripId/location/latest", (0, asyncHandler_1.asyncHandler)(locationController_1.latestTripLocation));
router.post("/trips/:tripId/hold", (0, asyncHandler_1.asyncHandler)(holdsController_1.createHold));
router.get("/holds/my", (0, asyncHandler_1.asyncHandler)(holdsController_1.listMyHolds));
router.delete("/holds/:holdId", (0, asyncHandler_1.asyncHandler)(holdsController_1.deleteHold));
router.post("/holds/:holdId/commit", (0, asyncHandler_1.asyncHandler)(holdsController_1.commitHold));
router.get("/queues/my", (0, asyncHandler_1.asyncHandler)(queuesController_1.getMyQueues));
router.get("/queues/:queueId", (0, asyncHandler_1.asyncHandler)(queuesController_1.getQueue));
router.post("/queues/:queueId/cancel", (0, asyncHandler_1.asyncHandler)(queuesController_1.cancelQueue));
router.post("/queues/:queueId/payment-slip", upload.single("slip"), (0, asyncHandler_1.asyncHandler)(paymentsController_1.uploadPaymentSlip));
router.get("/queues/:queueId/payment", (0, asyncHandler_1.asyncHandler)(paymentsController_1.getPaymentByQueue));
router.post("/me/fcm-token", (0, asyncHandler_1.asyncHandler)(tokensController_1.saveFcmToken));
exports.default = router;
//# sourceMappingURL=protectedRoutes.js.map