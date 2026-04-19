/**
 * Booking Routes - Placeholder
 * Booking functionality is handled via Trip and Queue
 */
const express = require('express');
const router = express.Router();

// Health check
router.get('/', (req, res) => {
    res.json({ message: 'Booking routes active' });
});

module.exports = router;
