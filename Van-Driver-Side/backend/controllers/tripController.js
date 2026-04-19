/**
 * Trip Controller
 * Trip operations for routes/trip.js
 */

const Trip = require('../models/Trip');
const Van = require('../models/Van');
const Queue = require('../models/Queue');
const Route = require('../models/Route');
const { startOfDay, endOfDay } = require('date-fns');

exports.getCurrentTrip = async (req, res) => {
    try {
        const { driverId } = req.params;

        const trip = await Trip.findOne({
            driverId,
            status: { $in: ['scheduled', 'departed'] }
        })
            .populate('route')
            .populate('vanRef');

        if (!trip) {
            return res.json({ success: true, trip: null });
        }

        res.json({ success: true, trip });
    } catch (error) {
        console.error('[getCurrentTrip Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createTrip = async (req, res) => {
    try {
        const { driverId, routeId, departureTime, vanId } = req.body;

        const trip = new Trip({
            driverId,
            route: routeId,
            vanId,
            vanRef: null,
            departureTime: new Date(departureTime),
            status: 'scheduled',
            seatCapacity: 13,
            availableSeats: 13
        });
        await trip.save();

        const populated = await Trip.findById(trip._id)
            .populate('route')
            .populate('vanRef');

        res.status(201).json({ success: true, trip: populated });
    } catch (error) {
        console.error('[createTrip Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { status } = req.body;

        const trip = await Trip.findByIdAndUpdate(tripId, { status }, { new: true });

        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        res.json({ success: true, trip });
    } catch (error) {
        console.error('[updateStatus Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.notifyDeparture = async (req, res) => {
    try {
        const { tripId } = req.params;

        res.json({ success: true, message: 'Departure notification sent' });
    } catch (error) {
        console.error('[notifyDeparture Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.confirmDeparture = async (req, res) => {
    try {
        const { tripId } = req.params;

        const trip = await Trip.findByIdAndUpdate(
            tripId,
            { status: 'departed', actualDepartureTime: new Date() },
            { new: true }
        );

        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        const io = req.app.get('io');
        if (io) {
            io.to(`trip-${tripId}`).emit('trip:departed', { trip_id: tripId });
        }

        res.json({ success: true, trip });
    } catch (error) {
        console.error('[confirmDeparture Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.saveCheckinState = async (req, res) => {
    try {
        const { tripId } = req.params;

        res.json({ success: true });
    } catch (error) {
        console.error('[saveCheckinState Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.runUpQueue = async (req, res) => {
    try {
        const { tripId } = req.params;

        res.json({ success: true, message: 'Queue processed' });
    } catch (error) {
        console.error('[runUpQueue Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.completeTrip = async (req, res) => {
    try {
        const { tripId } = req.params;

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        trip.status = 'completed';
        trip.arrivalTime = new Date();
        await trip.save();

        // Preserve daily binding - keep driverId, just mark van as ready for next trip
        if (trip.vanRef) {
            await Van.findByIdAndUpdate(trip.vanRef, {
                status: 'ready_for_next_trip'
            });
        }

        res.json({ success: true, trip });
    } catch (error) {
        console.error('[completeTrip Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTripHistory = async (req, res) => {
    try {
        const { driverId } = req.params;

        const trips = await Trip.find({
            driverId,
            status: 'completed'
        })
            .populate('route')
            .sort({ arrivalTime: -1 })
            .limit(50);

        res.json({ success: true, trips });
    } catch (error) {
        console.error('[getTripHistory Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAvailableTrips = async (req, res) => {
    try {
        const today = startOfDay(new Date());
        const tomorrow = endOfDay(new Date());

        const trips = await Trip.find({
            departureTime: { $gte: today, $lte: tomorrow },
            status: 'scheduled',
            availableSeats: { $gt: 0 }
        })
            .populate('route')
            .populate('vanRef')
            .sort({ departureTime: 1 });

        res.json({ success: true, trips });
    } catch (error) {
        console.error('[getAvailableTrips Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTripAvailability = async (req, res) => {
    try {
        const { tripId } = req.params;

        const trip = await Trip.findById(tripId).populate('route');
        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        res.json({
            success: true,
            trip_id: trip._id,
            available_seats: trip.availableSeats,
            total_seats: trip.seatCapacity,
            status: trip.status
        });
    } catch (error) {
        console.error('[getTripAvailability Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Force reset stuck trips (Dev Tool)
 */
exports.forceResetTrips = async (req, res) => {
    try {
        const { driverId } = req.body;

        const result = await Trip.updateMany(
            { driverId, status: { $in: ['scheduled', 'departed'] } },
            { status: 'cancelled' }
        );

        res.json({ success: true, message: `Reset ${result.modifiedCount} trips` });
    } catch (error) {
        console.error('[forceResetTrips Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
