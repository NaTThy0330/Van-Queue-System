/**
 * Input Validation Middleware
 * ตรวจสอบข้อมูล Input ก่อนเข้า Controller
 */

const { AppError } = require('./errorHandler');

// Validate required fields
const validateRequired = (fields) => (req, res, next) => {
    const missing = fields.filter(field => {
        const value = req.body[field];
        return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
        return next(new AppError(`กรุณากรอก: ${missing.join(', ')}`, 400));
    }
    next();
};

// Validate phone number format (Thai)
const validatePhone = (req, res, next) => {
    const { phone } = req.body;
    if (phone) {
        const phoneRegex = /^0[0-9]{8,9}$/;
        if (!phoneRegex.test(phone.replace(/-/g, ''))) {
            return next(new AppError('รูปแบบเบอร์โทรไม่ถูกต้อง (เช่น 0812345678)', 400));
        }
    }
    next();
};

// Validate MongoDB ObjectId
const validateObjectId = (paramName) => (req, res, next) => {
    const id = req.params[paramName];
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (id && !objectIdRegex.test(id)) {
        return next(new AppError(`รูปแบบ ${paramName} ไม่ถูกต้อง`, 400));
    }
    next();
};

// Validate van number format
const validateVanNumber = (req, res, next) => {
    const { vanNumber } = req.body;
    if (vanNumber) {
        // Allow Thai characters, numbers, hyphens
        const vanRegex = /^[ก-๙A-Za-z0-9\-]+$/;
        if (!vanRegex.test(vanNumber)) {
            return next(new AppError('รูปแบบหมายเลขรถตู้ไม่ถูกต้อง', 400));
        }
    }
    next();
};

// Sanitize input - remove dangerous characters
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                // Remove potential XSS characters
                obj[key] = obj[key]
                    .replace(/[<>]/g, '')
                    .trim();
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };

    if (req.body) sanitize(req.body);
    next();
};

module.exports = {
    validateRequired,
    validatePhone,
    validateObjectId,
    validateVanNumber,
    sanitizeInput
};
