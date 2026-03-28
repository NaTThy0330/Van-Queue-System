/**
 * Queue Routes - Placeholder
 * Queue operations handled via /api/driver routes
 */
const express = require('express');
const router = express.Router();

// Health check
router.get('/', (req, res) => {
    res.json({ message: 'Queue routes active' });
});

module.exports = router;
