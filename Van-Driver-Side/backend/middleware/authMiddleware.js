/**
 * JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'van-queue-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('กรุณาเข้าสู่ระบบ', 401));
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Token ไม่ถูกต้อง', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token หมดอายุ กรุณาเข้าสู่ระบบใหม่', 401));
        }
        return next(new AppError('การยืนยันตัวตนล้มเหลว', 401));
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้', 403));
        }
        next();
    };
};

const optionalAuth = (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = { id: decoded.id, role: decoded.role };
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    generateToken,
    protect,
    authorize,
    optionalAuth,
    JWT_SECRET
};
