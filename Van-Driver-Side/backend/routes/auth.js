/**
 * Auth Routes - Placeholder
 * Driver app uses /api/driver/login instead
 */
const express = require('express');
const router = express.Router();

// Health check
router.get('/', (req, res) => {
    res.json({ message: 'Auth routes - Use /api/driver/login for driver authentication' });
});

module.exports = router;
