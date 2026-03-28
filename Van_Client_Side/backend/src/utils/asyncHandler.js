"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
const asyncHandler = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    }
    catch (error) {
        next(error);
    }
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=asyncHandler.js.map