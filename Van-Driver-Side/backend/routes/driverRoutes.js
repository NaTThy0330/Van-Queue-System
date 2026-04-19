/**
 * Driver Routes
 */
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// Auth
router.post('/register', driverController.register);
router.post('/login', driverController.login);
router.get('/profile', driverController.getProfile);
router.get('/profile/:id', driverController.getProfile);

// Van
router.get('/vans/available', driverController.getAvailableVans);
router.post('/select-van', driverController.selectVan);

// Routes
router.get('/routes', driverController.getRoutes);

// Trips
router.get('/trips/available', driverController.getAvailableTrips);
router.post('/trips/create', driverController.createTrip);
router.get('/trips/current/:driver_id', driverController.getCurrentTrip);
router.get('/trips/:trip_id/passengers', driverController.getPassengers);
router.get('/trips/:trip_id/stats', driverController.getDashboardStats);

// Walk-in
router.post('/walk-in', driverController.quickWalkin);

// Passenger
router.post('/queue/:queue_id/check-in', driverController.checkInPassenger);
router.post('/queue/:queue_id/cancel', driverController.cancelPassenger);

// Trip Status
router.post('/trips/:trip_id/notify-departure', driverController.sendDepartureNotification);
router.post('/trips/:trip_id/depart', driverController.confirmDeparture);
router.post('/trips/:trip_id/clear-noshow', driverController.clearNoShow);
router.post('/trips/:trip_id/abandon', driverController.abandonTrip);
router.post('/trips/:trip_id/complete', driverController.completeTrip);

// Trip Assignment (TripList → assign existing scheduled trip to driver)
router.post('/trips/:trip_id/assign', driverController.assignTrip);

// Payments (PaymentVerification page)
router.get('/payments/pending/:trip_id', driverController.getPendingPayments);
router.post('/payments/:payment_id/verify', driverController.verifyPayment);

// Daily Shift
router.get('/shift/status/:driver_id', driverController.getShiftStatus);
router.get('/vans/:van_id/binding', driverController.checkVanBinding);
router.post('/shift/change-van', driverController.changeVan);

module.exports = router;
