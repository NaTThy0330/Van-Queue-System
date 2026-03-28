"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRoutes = void 0;
const Route_1 = require("../models/Route");
const listRoutes = async (_req, res) => {
    const routes = await Route_1.RouteModel.find().sort({ origin: 1, destination: 1 });
    res.json({ routes });
};
exports.listRoutes = listRoutes;
//# sourceMappingURL=routesController.js.map