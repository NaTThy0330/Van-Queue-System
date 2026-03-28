const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

// Get all routes
router.get('/', async (req, res) => {
    try {
        const routes = await Route.find().sort({ origin: 1, destination: 1 });
        res.json(routes);
    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({ error: 'Failed to get routes' });
    }
});

// Get route by ID
router.get('/:routeId', async (req, res) => {
    try {
        const route = await Route.findById(req.params.routeId);
        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }
        res.json(route);
    } catch (error) {
        console.error('Get route error:', error);
        res.status(500).json({ error: 'Failed to get route' });
    }
});

// Create new route (admin only)
router.post('/create', async (req, res) => {
    try {
        const { origin, destination, distance } = req.body;

        const route = new Route({
            origin,
            destination,
            distance
        });

        await route.save();

        res.json({
            success: true,
            route
        });
    } catch (error) {
        console.error('Create route error:', error);
        res.status(500).json({ error: 'Failed to create route' });
    }
});

module.exports = router;
