/**
 * File Upload Middleware
 * จัดการการอัปโหลดไฟล์ด้วย Multer
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้าง uploads folder ถ้ายังไม่มี
const uploadsDir = path.join(__dirname, '../uploads');
const slipsDir = path.join(uploadsDir, 'slips');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(slipsDir)) {
    fs.mkdirSync(slipsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, slipsDir);
    },
    filename: (req, file, cb) => {
        // Format: slip_bookingId_timestamp.ext
        const bookingId = req.params.bookingId || 'unknown';
        const ext = path.extname(file.originalname);
        const filename = `slip_${bookingId}_${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// File filter - รับเฉพาะรูปภาพ
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (jpeg, jpg, png, gif, webp)'), false);
    }
};

// Multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// Middleware for single slip upload
const uploadSlip = upload.single('slip');

// Error handler wrapper
const handleUpload = (req, res, next) => {
    uploadSlip(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'ไฟล์ใหญ่เกินไป (สูงสุด 5MB)' });
            }
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// Get file URL from request
const getFileUrl = (req) => {
    if (!req.file) return null;
    return `/uploads/slips/${req.file.filename}`;
};

module.exports = {
    upload,
    uploadSlip,
    handleUpload,
    getFileUrl,
    slipsDir
};
