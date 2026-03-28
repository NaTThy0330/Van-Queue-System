/**
 * Walk-in Routes - Placeholder
 * Walk-in handled via /api/driver/walk-in
 */
const express = require('express');
const router = express.Router();

// Health check
router.get('/', (req, res) => {
    res.json({ message: 'Walk-in routes active - Use /api/driver/walk-in' });
});

module.exports = router;
