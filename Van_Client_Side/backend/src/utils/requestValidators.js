"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireString = void 0;
const AppError_1 = require("./AppError");
const requireString = (value, name) => {
    if (typeof value !== "string" || value.trim() === "") {
        throw new AppError_1.AppError(`${name} is required`, 400);
    }
    return value;
};
exports.requireString = requireString;
//# sourceMappingURL=requestValidators.js.map