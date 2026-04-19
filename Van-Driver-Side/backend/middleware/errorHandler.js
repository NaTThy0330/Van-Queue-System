/**
 * Centralized Error Handler Middleware
 */

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    console.error(`Error: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // MongoDB duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        err.message = `${field} นี้มีอยู่ในระบบแล้ว`;
        err.statusCode = 400;
    }

    // MongoDB validation
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        err.message = errors.join(', ');
        err.statusCode = 400;
    }

    // MongoDB CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        err.message = 'รูปแบบข้อมูลไม่ถูกต้อง';
        err.statusCode = 400;
    }

    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

const notFoundHandler = (req, res, next) => {
    const err = new AppError(`ไม่พบ endpoint: ${req.originalUrl}`, 404);
    next(err);
};

module.exports = {
    AppError,
    asyncHandler,
    errorHandler,
    notFoundHandler
};
