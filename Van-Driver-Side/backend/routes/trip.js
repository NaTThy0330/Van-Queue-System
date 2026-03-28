/**
 * Trip Routes
 * Clean Architecture: Routes only handle routing, Controllers handle logic
 */

const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequired, validateObjectId, sanitizeInput } = require('../middleware/validate');

/**
 * @route   GET /api/trip/driver/:driverId/current
 * @desc    Get driver's current active trip
 * @access  Private
 */
router.get('/driver/:driverId/current',
    validateObjectId('driverId'),
    asyncHandler(tripController.getCurrentTrip)
);

/**
 * @route   POST /api/trip/create
 * @desc    Create a new trip
 * @access  Private
 */
router.post('/create',
    sanitizeInput,
    validateRequired(['driverId', 'routeId', 'departureTime']),
    asyncHandler(tripController.createTrip)
);

/**
 * @route   PUT /api/trip/:tripId/status
 * @desc    Update trip status
 * @access  Private
 */
router.put('/:tripId/status',
    validateObjectId('tripId'),
    sanitizeInput,
    validateRequired(['status']),
    asyncHandler(tripController.updateStatus)
);

/**
 * @route   POST /api/trip/:tripId/notify-departure
 * @desc    Notify passengers about departure
 * @access  Private
 */
router.post('/:tripId/notify-departure',
    validateObjectId('tripId'),
    asyncHandler(tripController.notifyDeparture)
);

/**
 * @route   POST /api/trip/:tripId/confirm-departure
 * @desc    Confirm trip has departed
 * @access  Private
 */
router.post('/:tripId/confirm-departure',
    validateObjectId('tripId'),
    asyncHandler(tripController.confirmDeparture)
);

/**
 * @route   POST /api/trip/:tripId/save-checkin-state
 * @desc    Auto-save check-in state
 * @access  Private
 */
router.post('/:tripId/save-checkin-state',
    validateObjectId('tripId'),
    sanitizeInput,
    asyncHandler(tripController.saveCheckinState)
);

/**
 * @route   POST /api/trip/:tripId/run-up-queue
 * @desc    Run up queue before departure
 * @access  Private
 */
router.post('/:tripId/run-up-queue',
    validateObjectId('tripId'),
    sanitizeInput,
    asyncHandler(tripController.runUpQueue)
);

/**
 * @route   POST /api/trip/:tripId/complete
 * @desc    Complete trip and auto-reset for next trip
 * @access  Private
 */
router.post('/:tripId/complete',
    validateObjectId('tripId'),
    asyncHandler(tripController.completeTrip)
);

/**
 * @route   GET /api/trip/driver/:driverId/history
 * @desc    Get driver's completed trips history
 * @access  Private
 */
router.get('/driver/:driverId/history',
    validateObjectId('driverId'),
    asyncHandler(tripController.getTripHistory)
);

/**
 * @route   GET /api/trips/available
 * @desc    Get available trips for passengers (UCP-1, UCP-2)
 * @access  Public
 */
router.get('/available',
    asyncHandler(tripController.getAvailableTrips)
);

/**
 * @route   GET /api/trip/:tripId/availability (Passenger App)
 * @desc    Get trip availability in Passenger App format
 * @access  Public
 */
router.get('/:tripId/availability',
    validateObjectId('tripId'),
    asyncHandler(tripController.getTripAvailability)
);

/**
 * @route   POST /api/trip/force-reset
 * @desc    Force reset driver's stuck trips (Dev Tool)
 * @access  Private
 */
router.post('/force-reset',
    sanitizeInput,
    asyncHandler(tripController.forceResetTrips)
);

module.exports = router;

