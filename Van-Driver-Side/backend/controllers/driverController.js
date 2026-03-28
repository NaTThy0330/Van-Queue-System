/**
 * Driver Controller
 * Auth, Profile, Van Selection, Trips, Walk-in, EndTrip
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Van = require('../models/Van');
const Trip = require('../models/Trip');
const Queue = require('../models/Queue');
const Route = require('../models/Route');
const Payment = require('../models/Payment');

const JWT_SECRET = process.env.JWT_SECRET || 'van-queue-secret-key-2026';

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ==================== AUTH ====================

exports.register = async (req, res) => {
    try {
        const { name, phone, license_no, password } = req.body;

        if (!name || !phone || !license_no || !password) {
            return res.status(400).json({ success: false, error: 'à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹„à¸¡à¹ˆà¸„à¸£à¸šà¸–à¹‰à¸§à¸™' });
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, error: 'à¹€à¸šà¸­à¸£à¹Œà¹‚à¸—à¸£à¸¨à¸±à¸žà¸—à¹Œà¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡' });
        }

        const existingByPhone = await User.findOne({ phone });
        if (existingByPhone) {
            return res.status(409).json({ success: false, error: 'à¹€à¸šà¸­à¸£à¹Œà¹‚à¸—à¸£à¸¨à¸±à¸žà¸—à¹Œà¸™à¸µà¹‰à¸–à¸¹à¸à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¹à¸¥à¹‰à¸§' });
        }

        const existingByLicense = await User.findOne({ license_no });
        if (existingByLicense) {
            return res.status(409).json({ success: false, error: 'à¹€à¸¥à¸‚à¹ƒà¸šà¸‚à¸±à¸šà¸‚à¸µà¹ˆà¸™à¸µà¹‰à¸–à¸¹à¸à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¹à¸¥à¹‰à¸§' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newDriver = new User({
            name: name.trim(),
            phone,
            license_no,
            password_hash: hashedPassword,
            role: 'driver'
        });
        await newDriver.save();

        console.log(`[Register] New driver: ${phone}`);

        res.status(201).json({
            success: true,
            message: 'à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™à¸ªà¸³à¹€à¸£à¹‡à¸ˆ',
            driver_id: newDriver._id
        });

    } catch (error) {
        console.error('[Register Error]', error);
        res.status(500).json({ success: false, error: 'à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”à¹ƒà¸™à¸à¸²à¸£à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™' });
    }
};

exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ success: false, error: 'à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¹€à¸šà¸­à¸£à¹Œà¹‚à¸—à¸£à¹à¸¥à¸°à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™' });
        }

        const driver = await User.findOne({ phone });

        if (!driver || driver.role !== 'driver') {
            return res.status(401).json({ success: false, error: 'à¸«à¸¡à¸²à¸¢à¹€à¸¥à¸‚à¹‚à¸—à¸£à¸¨à¸±à¸žà¸—à¹Œà¸«à¸£à¸·à¸­à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™à¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡' });
        }

        // Support both password and password_hash fields
        const storedPassword = driver.password || driver.password_hash;
        if (!storedPassword) {
            return res.status(401).json({ success: false, error: 'à¸šà¸±à¸à¸Šà¸µà¸™à¸µà¹‰à¹„à¸¡à¹ˆà¸¡à¸µà¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™ à¸à¸£à¸¸à¸“à¸²à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™à¹ƒà¸«à¸¡à¹ˆ' });
        }

        const isMatch = await bcrypt.compare(password, storedPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'à¸«à¸¡à¸²à¸¢à¹€à¸¥à¸‚à¹‚à¸—à¸£à¸¨à¸±à¸žà¸—à¹Œà¸«à¸£à¸·à¸­à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™à¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡' });
        }

        const token = jwt.sign(
            { id: driver._id, role: 'driver' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log(`[Login] ${driver.name} (${driver.phone})`);

        res.json({
            success: true,
            token,
            driver: {
                id: driver._id,
                name: driver.name,
                phone: driver.phone,
                license_no: driver.license_no
            }
        });

    } catch (error) {
        console.error('[Login Error]', error);
        res.status(500).json({ success: false, error: 'à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const driverId = req.driver?.id || req.params.id;

        const driver = await User.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸„à¸™à¸‚à¸±à¸š' });
        }

        const van = await Van.findOne({ driver_id: driverId });

        const currentTrip = await Trip.findOne({
            driverId,
            status: { $in: ['scheduled', 'departed'] }
        }).populate('route');

        res.json({
            success: true,
            driver: {
                id: driver._id,
                name: driver.name,
                phone: driver.phone,
                license_no: driver.license_no,
                status: van?.status === 'on-duty' ? 'on-duty' : 'off-duty'
            },
            van_info: van ? {
                van_id: van._id,
                plate_number: van.plate_number,
                seat_capacity: van.seat_capacity || 13
            } : null,
            current_trip: currentTrip ? {
                trip_id: currentTrip._id,
                route: currentTrip.route,
                departure_time: currentTrip.departureTime,
                status: currentTrip.status
            } : null
        });

    } catch (error) {
        console.error('[Profile Error]', error);
        res.status(500).json({ success: false, error: 'à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

// ==================== VAN SELECTION ====================

exports.getAvailableVans = async (req, res) => {
    try {
        const vans = await Van.find({ status: 'available' });
        res.json({ success: true, vans });
    } catch (error) {
        console.error('[Vans Error]', error);
        res.status(500).json({ success: false, error: 'à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸£à¸–à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

/**
 * Select Van (Start Shift) â€” Dynamic Upsert with daily binding
 */
exports.selectVan = async (req, res) => {
    try {
        const { driver_id, plate_number } = req.body;

        if (!driver_id || !plate_number) {
            return res.status(400).json({ success: false, error: 'à¸à¸£à¸¸à¸“à¸²à¸£à¸°à¸šà¸¸ driver_id à¹à¸¥à¸° plate_number' });
        }

        const normalizedPlate = plate_number.trim();
        const today = getTodayStr();

        const existingVan = await Van.findOne({ plate_number: normalizedPlate });

        // Check if bound to another driver today
        if (existingVan &&
            existingVan.current_driver_id &&
            existingVan.last_active_date === today &&
            existingVan.current_driver_id.toString() !== driver_id) {
            return res.status(400).json({
                success: false,
                error: 'à¸£à¸–à¸„à¸±à¸™à¸™à¸µà¹‰à¸–à¸¹à¸à¸œà¸¹à¸à¸à¸±à¸šà¸„à¸™à¸‚à¸±à¸šà¸—à¹ˆà¸²à¸™à¸­à¸·à¹ˆà¸™à¹à¸¥à¹‰à¸§à¸§à¸±à¸™à¸™à¸µà¹‰',
                code: 'VAN_BOUND_TODAY'
            });
        }

        // Check on-duty by another driver
        if (existingVan && existingVan.status === 'on-duty' && existingVan.driver_id?.toString() !== driver_id) {
            return res.status(400).json({
                success: false,
                error: 'à¸£à¸–à¸„à¸±à¸™à¸™à¸µà¹‰à¸à¸³à¸¥à¸±à¸‡à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¹‚à¸”à¸¢à¸„à¸™à¸‚à¸±à¸šà¸—à¹ˆà¸²à¸™à¸­à¸·à¹ˆà¸™ (à¸ªà¸–à¸²à¸™à¸°: on-duty)',
                code: 'VAN_NOT_AVAILABLE'
            });
        }

        // Release any previously bound van
        await Van.updateMany(
            { current_driver_id: driver_id, _id: { $ne: existingVan?._id } },
            { $set: { current_driver_id: null, driver_id: null, status: 'available' } }
        );

        // Upsert van with daily binding
        const van = await Van.findOneAndUpdate(
            { plate_number: normalizedPlate },
            {
                $set: {
                    status: 'on-duty',
                    driver_id: driver_id,
                    current_driver_id: driver_id,
                    last_active_date: today
                },
                $setOnInsert: {
                    seat_capacity: 13,
                    model: 'Toyota Commuter'
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await User.findByIdAndUpdate(driver_id, { vanNumber: normalizedPlate });

        console.log(`[Van Selected] ${normalizedPlate} â†’ Driver: ${driver_id}`);

        res.json({
            success: true,
            van: {
                van_id: van._id,
                plate_number: van.plate_number,
                seat_capacity: van.seat_capacity,
                status: 'on-duty'
            }
        });

    } catch (error) {
        console.error('[SelectVan Error]', error);
        res.status(500).json({ success: false, error: 'à¹€à¸¥à¸·à¸­à¸à¸£à¸–à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ' });
    }
};

// ==================== TRIPS ====================

exports.getAvailableTrips = async (req, res) => {
    try {
        const trips = await Trip.find({
            status: 'scheduled',
            driverId: null
        })
            .populate('route')
            .populate('vanRef')
            .sort({ departureTime: 1 });

        res.json({ success: true, trips });
    } catch (error) {
        console.error('[Trips Error]', error);
        res.status(500).json({ success: false, error: 'à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸£à¸­à¸šà¸£à¸–à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find();
        res.json({ success: true, routes });
    } catch (error) {
        console.error('[Routes Error]', error);
        res.status(500).json({ success: false, error: 'à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸ªà¹‰à¸™à¸—à¸²à¸‡à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

exports.createTrip = async (req, res) => {
    try {
        const { driver_id, van_id, route_id, departure_time } = req.body;

        if (!driver_id || !route_id || !departure_time) {
            return res.status(400).json({ success: false, error: 'à¸à¸£à¸¸à¸“à¸²à¸£à¸°à¸šà¸¸ driver_id, route_id à¹à¸¥à¸° departure_time' });
        }

        let van;
        if (van_id) {
            van = await Van.findById(van_id);
        } else {
            const driver = await User.findById(driver_id);
            if (driver?.vanNumber) {
                van = await Van.findOne({ plate_number: driver.vanNumber });
            }
        }

        if (!van) {
            return res.status(400).json({ success: false, error: 'à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸£à¸–à¸à¹ˆà¸­à¸™', code: 'NO_VAN' });
        }

        const existing = await Trip.findOne({
            driverId: driver_id,
            status: { $in: ['scheduled', 'departed'] }
        });

        if (existing) {
            return res.status(400).json({ success: false, error: 'à¸„à¸¸à¸“à¸¡à¸µà¸£à¸­à¸šà¸£à¸–à¸—à¸µà¹ˆà¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¹€à¸ªà¸£à¹‡à¸ˆà¸ªà¸´à¹‰à¸™', code: 'TRIP_EXISTS' });
        }

        const trip = new Trip({
            driverId: driver_id,
            vanRef: van._id,
            vanId: van.plate_number,
            route: route_id,
            departureTime: new Date(departure_time),
            seatCapacity: van.seat_capacity || 13,
            availableSeats: van.seat_capacity || 13,
            status: 'scheduled'
        });
        await trip.save();

        const populatedTrip = await Trip.findById(trip._id)
            .populate('route')
            .populate('vanRef');

        const io = req.app.get('io');
        if (io) {
            io.emit('trip:created', {
                trip_id: trip._id,
                route: populatedTrip.route,
                departure_time: trip.departureTime
            });
        }

        res.status(201).json({ success: true, trip: populatedTrip });

    } catch (error) {
        console.error('[CreateTrip Error]', error);
        res.status(500).json({ success: false, error: 'à¸ªà¸£à¹‰à¸²à¸‡à¸£à¸­à¸šà¸£à¸–à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

/**
 * Assign Trip â€” bind an existing scheduled trip to this driver+van
 * Called by TripList when driver selects a pre-generated trip slot
 */
exports.assignTrip = async (req, res) => {
    try {
        const { trip_id } = req.params;
        const { driver_id, van_id } = req.body;

        if (!driver_id) {
            return res.status(400).json({ success: false, error: 'à¸à¸£à¸¸à¸“à¸²à¸£à¸°à¸šà¸¸ driver_id' });
        }

        // Check driver doesn't already have an active trip
        const existingTrip = await Trip.findOne({
            driverId: driver_id,
            status: { $in: ['scheduled', 'departed'] }
        });
        if (existingTrip) {
            return res.status(400).json({ success: false, error: 'à¸„à¸¸à¸“à¸¡à¸µà¸£à¸­à¸šà¸£à¸–à¸—à¸µà¹ˆà¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¹€à¸ªà¸£à¹‡à¸ˆà¸ªà¸´à¹‰à¸™', code: 'TRIP_EXISTS' });
        }

        // Find trip and check it's still available
        const trip = await Trip.findOne({
            _id: trip_id,
            status: 'scheduled',
            driverId: null
        });
        if (!trip) {
            return res.status(404).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸žà¸šà¸£à¸­à¸šà¸£à¸–à¸™à¸µà¹‰ à¸«à¸£à¸·à¸­à¸–à¸¹à¸à¹€à¸¥à¸·à¸­à¸à¹„à¸›à¹à¸¥à¹‰à¸§', code: 'TRIP_NOT_AVAILABLE' });
        }

        // Get van - either from param or from driver's current van
        let vanDoc;
        if (van_id) {
            vanDoc = await Van.findById(van_id);
        } else {
            const driver = await User.findById(driver_id);
            if (driver?.vanNumber) {
                vanDoc = await Van.findOne({ plate_number: driver.vanNumber });
            }
        }
        if (!vanDoc) {
            return res.status(400).json({ success: false, error: 'à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸£à¸–à¸à¹ˆà¸­à¸™', code: 'NO_VAN' });
        }

        // Assign driver + van to trip
        trip.driverId = driver_id;
        trip.vanRef = vanDoc._id;
        trip.vanId = vanDoc.plate_number;
        trip.seatCapacity = vanDoc.seat_capacity || 13;
        trip.availableSeats = vanDoc.seat_capacity || 13;
        await trip.save();

        // Mark van as on-duty
        await Van.findByIdAndUpdate(vanDoc._id, { status: 'on-duty' });

        const populatedTrip = await Trip.findById(trip._id)
            .populate('route')
            .populate('vanRef');

        const io = req.app.get('io');
        if (io) {
            io.emit('trip:assigned', {
                trip_id: trip._id,
                driver_id,
                departure_time: trip.departureTime
            });
        }

        console.log(`[AssignTrip] Trip ${trip_id} â†’ Driver ${driver_id}`);

        res.json({ success: true, trip: populatedTrip });

    } catch (error) {
        console.error('[AssignTrip Error]', error);
        res.status(500).json({ success: false, error: 'à¹€à¸¥à¸·à¸­à¸à¸£à¸­à¸šà¸£à¸–à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

// ==================== PAYMENTS ====================

const Booking = require('../models/Booking');

/**
 * Get pending payments (unpaid online bookings) for a trip
 */
exports.getPendingPayments = async (req, res) => {
    try {
        const { trip_id } = req.params;
        const passengerBaseUrl = process.env.PASSENGER_BASE_URL || 'http://localhost:3000';

        // First try Queue-based approach (current architecture)
        const pendingQueues = await Queue.find({
            trip: trip_id,
            queueType: 'online_unpaid',
            paymentStatus: 'unpaid',
            status: { $nin: ['cancelled', 'expired'] }
        }).sort({ createdAt: 1 });

        // Payment slips uploaded from Passenger App (online_paid)
        const pendingSlipPayments = await Payment.find({ status: 'pending' })
            .populate({
                path: 'queue',
                match: { trip: trip_id, status: { $nin: ['cancelled', 'expired'] } },
                select: 'passengerName queueType paymentStatus trip'
            })
            .sort({ createdAt: 1 });

        // Also check Booking model for Passenger App bookings
        const pendingBookings = await Booking.find({
            tripId: trip_id,
            type: 'unpaid',
            paymentStatus: 'pending',
            status: 'active'
        }).sort({ createdAt: 1 });

        const payments = [
            ...pendingQueues.map(q => ({
                _id: q._id,
                source: 'queue',
                passenger_name: q.passengerName || 'à¹„à¸¡à¹ˆà¸£à¸°à¸šà¸¸à¸Šà¸·à¹ˆà¸­',
                amount: 0,
                slip_url: null,
                queue_type: q.queueType,
                payment_status: q.paymentStatus
            })),
            ...pendingSlipPayments
                .filter(p => p.queue)
                .map(p => ({
                    _id: p._id,
                    source: 'payment',
                    passenger_name: p.queue?.passengerName || 'ไม่ระบุชื่อ',
                    amount: p.amount || 0,
                    slip_url: p.slipUrl ? `${passengerBaseUrl}${p.slipUrl}` : null,
                    queue_type: p.queue?.queueType,
                    payment_status: p.status,
                    queue_id: p.queue ? {
                        _id: p.queue._id,
                        passenger_name: p.queue.passengerName
                    } : null
                })),
            ...pendingBookings.map(b => ({
                _id: b._id,
                source: 'booking',
                passenger_name: b.passengerName || 'à¹„à¸¡à¹ˆà¸£à¸°à¸šà¸¸à¸Šà¸·à¹ˆà¸­',
                amount: 0,
                slip_url: b.paymentSlip ? `/uploads/slips/${b.paymentSlip}` : null,
                payment_status: b.paymentStatus
            }))
        ];

        res.json({ success: true, payments });

    } catch (error) {
        console.error('[GetPayments Error]', error);
        res.status(500).json({ success: false, error: 'à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

/**
 * Verify payment (approve or reject)
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { payment_id } = req.params;
        const { action, reason } = req.body; // action: 'approve' | 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, error: 'action à¸•à¹‰à¸­à¸‡à¹€à¸›à¹‡à¸™ approve à¸«à¸£à¸·à¸­ reject' });
        }

        // Try Payment (slip) first
        const payment = await Payment.findById(payment_id);
        if (payment) {
            if (action === 'approve') {
                await Payment.updateOne(
                    { _id: payment._id },
                    { $set: { status: 'verified', verifiedAt: new Date() } }
                );

                await Queue.findByIdAndUpdate(payment.queue, {
                    $set: { paymentStatus: 'paid' }
                });

                console.log(`[Verify] Payment ${payment_id} approved`);
                return res.json({ success: true, status: 'approved', source: 'payment' });
            } else {
                await Payment.updateOne(
                    { _id: payment._id },
                    { $set: { status: 'rejected', verifiedAt: new Date() } }
                );

                const queue = await Queue.findById(payment.queue);
                if (queue) {
                    queue.status = 'cancelled';
                    queue.cancelReason = reason || 'Payment rejected';
                    await queue.save();
                    await Trip.findByIdAndUpdate(queue.trip, { $inc: { availableSeats: queue.seatCount || 1 } });
                }

                console.log(`[Verify] Payment ${payment_id} rejected`);
                return res.json({ success: true, status: 'rejected', source: 'payment' });
            }
        }

        // Try Queue first
        const queue = await Queue.findById(payment_id);
        if (queue) {
            if (action === 'approve') {
                queue.paymentStatus = 'paid';
                queue.queueType = 'online_paid';
                await queue.save();
                console.log(`[Verify] Queue ${payment_id} approved`);
                return res.json({ success: true, status: 'approved', source: 'queue' });
            } else {
                queue.status = 'cancelled';
                await queue.save();
                // Restore seat
                await Trip.findByIdAndUpdate(queue.trip, { $inc: { availableSeats: 1 } });
                console.log(`[Verify] Queue ${payment_id} rejected`);
                return res.json({ success: true, status: 'rejected', source: 'queue' });
            }
        }

        // Try Booking
        const booking = await Booking.findById(payment_id);
        if (booking) {
            if (action === 'approve') {
                booking.type = 'paid';
                booking.paymentStatus = 'verified';
                await booking.save();
                console.log(`[Verify] Booking ${payment_id} approved`);
                return res.json({ success: true, status: 'approved', source: 'booking' });
            } else {
                booking.status = 'cancelled';
                booking.paymentStatus = 'rejected';
                await booking.save();
                // Restore seat
                await Trip.findByIdAndUpdate(booking.tripId, { $inc: { availableSeats: 1 } });
                console.log(`[Verify] Booking ${payment_id} rejected`);
                return res.json({ success: true, status: 'rejected', source: 'booking' });
            }
        }

        return res.status(404).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™' });

    } catch (error) {
        console.error('[VerifyPayment Error]', error);
        res.status(500).json({ success: false, error: 'à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

/**
 * Get Current Trip â€” prioritize 'departed' over 'scheduled'
 */
exports.getCurrentTrip = async (req, res) => {
    try {
        const { driver_id } = req.params;

        const trips = await Trip.find({
            driverId: driver_id,
            status: { $in: ['scheduled', 'departed'] }
        })
            .populate('route')
            .populate('vanRef')
            .sort({ status: 1 }); // 'departed' comes before 'scheduled' alphabetically

        const trip = trips.length > 0 ? trips[0] : null;

        if (!trip) {
            return res.status(200).json({ success: true, trip: null });
        }

        const passengers = await Queue.find({
            trip: trip._id,
            status: { $ne: 'cancelled' }
        }).sort({ createdAt: 1 });

        res.json({ success: true, trip, passengers });

    } catch (error) {
        console.error('[GetCurrentTrip Error]', error);
        res.status(500).json({ success: false, error: 'à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸£à¸­à¸šà¸£à¸–à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ' });
    }
};

// ==================== QUICK WALK-IN (ATOMIC) ====================

/**
 * Quick Walk-in â€” atomic $inc to prevent race conditions
 * Enforces 50% walk-in quota
 */
exports.quickWalkin = async (req, res) => {
    try {
        const { trip_id } = req.body;

        if (!trip_id) {
            return res.status(400).json({ success: false, error: 'à¸à¸£à¸¸à¸“à¸²à¸£à¸°à¸šà¸¸ trip_id' });
        }

        // Check walk-in quota (strict 50%)
        const tripCheck = await Trip.findById(trip_id);
        if (!tripCheck) {
            return res.status(404).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸žà¸šà¸£à¸­à¸šà¸£à¸–' });
        }

        const currentWalkIns = await Queue.countDocuments({
            trip: trip_id,
            queueType: 'walkin',
            status: { $ne: 'cancelled' }
        });

        const maxWalkIn = Math.ceil(tripCheck.seatCapacity * 0.5);

        if (currentWalkIns + 1 > maxWalkIn) {
            return res.status(400).json({
                success: false,
                error: `à¹‚à¸„à¸§à¸•à¸² Walk-in à¹€à¸•à¹‡à¸¡à¹à¸¥à¹‰à¸§ (à¸ˆà¸³à¸à¸±à¸” ${maxWalkIn} à¸—à¸µà¹ˆà¸™à¸±à¹ˆà¸‡)`,
                code: 'QUOTA_EXCEEDED'
            });
        }

        // Atomic seat decrement
        const trip = await Trip.findOneAndUpdate(
            {
                _id: trip_id,
                status: { $in: ['scheduled', 'departed'] },
                availableSeats: { $gte: 1 }
            },
            { $inc: { availableSeats: -1 } },
            { new: true }
        );

        if (!trip) {
            return res.status(400).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸¡à¸µà¸—à¸µà¹ˆà¸™à¸±à¹ˆà¸‡à¸§à¹ˆà¸²à¸‡à¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆà¸žà¸šà¸£à¸­à¸šà¸£à¸–', code: 'NO_SEATS' });
        }

        const seatNumber = trip.seatCapacity - trip.availableSeats;

        const queueEntry = new Queue({
            trip: trip_id,
            passengerName: `Walk-in #${seatNumber}`,
            seatCount: 1,
            queueType: 'walkin',
            bookingSource: 'walkin',
            status: 'checked_in',
            paymentStatus: 'paid'
        });
        await queueEntry.save();

        // Real-time socket update
        const io = req.app.get('io');
        if (io) {
            io.to(`trip-${trip_id}`).emit('seat:updated', { trip_id, available_seats: trip.availableSeats });
            io.to(`trip-${trip_id}`).emit('booking:added', {
                queue_id: queueEntry._id,
                passenger_name: queueEntry.passengerName,
                type: 'walkin'
            });
        }

        console.log(`[Walk-in] #${seatNumber}, Remaining: ${trip.availableSeats}`);

        res.json({
            success: true,
            queue: {
                queue_id: queueEntry._id,
                passenger_name: queueEntry.passengerName,
                seat_number: seatNumber,
                status: 'checked_in'
            },
            available_seats: trip.availableSeats
        });

    } catch (error) {
        console.error('[Walk-in Error]', error);
        res.status(500).json({ success: false, error: 'à¹€à¸žà¸´à¹ˆà¸¡ Walk-in à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

// ==================== NO-SHOW CLEARANCE ====================

// Bulk cancel pending passengers who haven't checked in
exports.clearNoShow = async (req, res) => {
    try {
        const { trip_id } = req.params;

        const trip = await Trip.findById(trip_id);
        if (!trip) {
            return res.status(404).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸žà¸šà¸£à¸­à¸šà¸£à¸–' });
        }

        // Find all pending (not checked-in) passengers
        const pendingQueues = await Queue.find({
            trip: trip_id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (pendingQueues.length === 0) {
            return res.status(400).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸¡à¸µà¸œà¸¹à¹‰à¹‚à¸”à¸¢à¸ªà¸²à¸£à¸—à¸µà¹ˆà¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸²' });
        }

        // Calculate total seats to release
        const seatsToRelease = pendingQueues.reduce((sum, q) => sum + (q.seatCount || 1), 0);

        // Bulk update all pending to no_show
        await Queue.updateMany(
            { trip: trip_id, status: { $in: ['pending', 'confirmed'] } },
            { $set: { status: 'no_show', cancelReason: 'à¹„à¸¡à¹ˆà¸¡à¸²à¹€à¸Šà¹‡à¸à¸­à¸´à¸™ (No-show)' } }
        );

        // Restore seats atomically
        const updatedTrip = await Trip.findByIdAndUpdate(
            trip_id,
            { $inc: { availableSeats: seatsToRelease } },
            { new: true }
        );

        // Real-time socket update
        const io = req.app.get('io');
        if (io) {
            io.to(`trip-${trip_id}`).emit('seat:updated', {
                trip_id,
                available_seats: updatedTrip.availableSeats
            });
        }

        console.log(`[No-show] Trip ${trip_id}: cleared ${pendingQueues.length} passengers, released ${seatsToRelease} seats`);

        res.json({
            success: true,
            cleared_count: pendingQueues.length,
            seats_released: seatsToRelease,
            available_seats: updatedTrip.availableSeats
        });
    } catch (error) {
        console.error('[No-show Error]', error);
        res.status(500).json({ success: false, error: 'à¹€à¸„à¸¥à¸µà¸¢à¸£à¹Œà¸—à¸µà¹ˆà¸™à¸±à¹ˆà¸‡à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

// ==================== PASSENGERS ====================

exports.getPassengers = async (req, res) => {
    try {
        const { trip_id } = req.params;
        const passengers = await Queue.find({
            trip: trip_id,
            status: { $nin: ['cancelled'] }
        }).sort({ createdAt: 1 });

        res.json({ success: true, passengers });
    } catch (error) {
        console.error('[Passengers Error]', error);
        res.status(500).json({ success: false, error: 'à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸œà¸¹à¹‰à¹‚à¸”à¸¢à¸ªà¸²à¸£à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

exports.checkInPassenger = async (req, res) => {
    try {
        const { queue_id } = req.params;
        const queue = await Queue.findByIdAndUpdate(
            queue_id,
            { status: 'checked_in', checkInTime: new Date() },
            { new: true }
        );

        if (!queue) {
            return res.status(404).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥' });
        }

        res.json({ success: true, queue });
    } catch (error) {
        console.error('[CheckIn Error]', error);
        res.status(500).json({ success: false, error: 'à¹€à¸Šà¹‡à¸à¸­à¸´à¸™à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

exports.cancelPassenger = async (req, res) => {
    try {
        const { queue_id } = req.params;
        const { reason } = req.body;

        const queue = await Queue.findById(queue_id);
        if (!queue) {
            return res.status(404).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥' });
        }

        if (queue.status === 'cancelled') {
            return res.status(400).json({ success: false, error: 'à¸•à¸±à¹‹à¸§à¸™à¸µà¹‰à¸–à¸¹à¸à¸¢à¸à¹€à¸¥à¸´à¸à¹„à¸›à¹à¸¥à¹‰à¸§' });
        }

        queue.status = 'cancelled';
        queue.cancelReason = reason || 'à¸¢à¸à¹€à¸¥à¸´à¸à¹‚à¸”à¸¢à¸„à¸™à¸‚à¸±à¸š';
        await queue.save();

        // Release seat and get updated trip
        const updatedTrip = await Trip.findByIdAndUpdate(
            queue.trip,
            { $inc: { availableSeats: queue.seatCount || 1 } },
            { new: true }
        );

        // Real-time socket update
        const io = req.app.get('io');
        if (io && updatedTrip) {
            io.to(`trip-${queue.trip}`).emit('seat:updated', {
                trip_id: queue.trip,
                available_seats: updatedTrip.availableSeats
            });
        }

        console.log(`[Cancel] Queue ${queue_id} (${queue.queueType}), Seats: ${updatedTrip?.availableSeats}`);

        res.json({
            success: true,
            seat_released: true,
            queue_type: queue.queueType,
            available_seats: updatedTrip?.availableSeats ?? null
        });
    } catch (error) {
        console.error('[Cancel Error]', error);
        res.status(500).json({ success: false, error: 'à¸¢à¸à¹€à¸¥à¸´à¸à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

// ==================== TRIP STATUS ====================

exports.sendDepartureNotification = async (req, res) => {
    try {
        const { trip_id } = req.params;

        const io = req.app.get('io');
        if (io) {
            io.to(`trip-${trip_id}`).emit('notify-departure', {
                trip_id,
                message: 'à¸£à¸–à¹ƒà¸à¸¥à¹‰à¸­à¸­à¸à¹à¸¥à¹‰à¸§ à¸à¸£à¸¸à¸“à¸²à¹€à¸•à¸£à¸µà¸¢à¸¡à¸•à¸±à¸§'
            });
        }

        res.json({ success: true, notifications_sent: true });
    } catch (error) {
        console.error('[Notify Error]', error);
        res.status(500).json({ success: false, error: 'à¸ªà¹ˆà¸‡à¸à¸²à¸£à¹à¸ˆà¹‰à¸‡à¹€à¸•à¸·à¸­à¸™à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

exports.confirmDeparture = async (req, res) => {
    try {
        const { trip_id } = req.params;
        const { current_location } = req.body;

        const trip = await Trip.findByIdAndUpdate(
            trip_id,
            { status: 'departed', actualDepartureTime: new Date() },
            { new: true }
        );

        if (!trip) {
            return res.status(404).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸žà¸šà¸£à¸­à¸šà¸£à¸–' });
        }

        const noShows = await Queue.find({
            trip: trip_id,
            status: 'pending',
            queueType: 'online_paid'
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`trip-${trip_id}`).emit('trip:departed', { trip_id });
        }

        console.log(`[Departed] Trip ${trip_id}`);

        res.json({
            success: true,
            trip_status: 'departed',
            no_show_passengers: noShows.map(p => ({
                queue_id: p._id,
                name: p.passengerName
            }))
        });

    } catch (error) {
        console.error('[Depart Error]', error);
        res.status(500).json({ success: false, error: 'à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸­à¸­à¸à¹€à¸”à¸´à¸™à¸—à¸²à¸‡à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

// Abandon Trip â€” undo trip selection if no passengers yet
exports.abandonTrip = async (req, res) => {
    try {
        const { trip_id } = req.params;

        const trip = await Trip.findById(trip_id);
        if (!trip) {
            return res.status(404).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸žà¸šà¸£à¸­à¸šà¸£à¸–' });
        }

        if (trip.status !== 'scheduled') {
            return res.status(400).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¢à¸à¹€à¸¥à¸´à¸à¸£à¸­à¸šà¸—à¸µà¹ˆà¸­à¸­à¸à¹€à¸”à¸´à¸™à¸—à¸²à¸‡à¹à¸¥à¹‰à¸§' });
        }

        // Check if any passengers exist
        const passengerCount = await Queue.countDocuments({
            trip: trip_id,
            status: { $ne: 'cancelled' }
        });

        if (passengerCount > 0) {
            return res.status(400).json({
                success: false,
                error: `à¸¡à¸µà¸œà¸¹à¹‰à¹‚à¸”à¸¢à¸ªà¸²à¸£ ${passengerCount} à¸„à¸™à¹à¸¥à¹‰à¸§ à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¢à¸à¹€à¸¥à¸´à¸à¹„à¸”à¹‰`
            });
        }

        // Clear driver/van binding from trip â€” reset to available slot
        trip.driverId = null;
        trip.vanRef = null;
        trip.status = 'scheduled';
        trip.availableSeats = trip.seatCapacity;
        await trip.save();

        console.log(`[Abandon] Trip ${trip_id} released by driver`);

        res.json({ success: true, message: 'à¸¢à¸à¹€à¸¥à¸´à¸à¸£à¸­à¸šà¸£à¸–à¸ªà¸³à¹€à¸£à¹‡à¸ˆ' });
    } catch (error) {
        console.error('[Abandon Error]', error);
        res.status(500).json({ success: false, error: 'à¸¢à¸à¹€à¸¥à¸´à¸à¸£à¸­à¸šà¸£à¸–à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

/**
 * Complete Trip â€” set van to 'ready_for_next_trip' (keep driver binding)
 */
exports.completeTrip = async (req, res) => {
    try {
        const { trip_id } = req.params;
        const { final_location } = req.body;

        const trip = await Trip.findById(trip_id);
        if (!trip) {
            return res.status(404).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸žà¸šà¸£à¸­à¸šà¸£à¸–' });
        }

        trip.status = 'completed';
        trip.arrivalTime = new Date();
        trip.completedAt = new Date();
        await trip.save();

        // Keep driver binding, just mark van ready for next trip
        if (trip.vanRef) {
            await Van.findByIdAndUpdate(trip.vanRef, { status: 'ready_for_next_trip' });
        }

        // Count today's rounds
        const today = getTodayStr();
        const todayStart = new Date(today + 'T00:00:00');
        const roundsToday = await Trip.countDocuments({
            driverId: trip.driverId,
            status: 'completed',
            completedAt: { $gte: todayStart }
        });

        const totalPassengers = await Queue.countDocuments({
            trip: trip_id,
            status: { $in: ['checked_in', 'confirmed'] }
        });

        const van = trip.vanRef ? await Van.findById(trip.vanRef) : null;

        const io = req.app.get('io');
        if (io) {
            io.to(`trip-${trip_id}`).emit('trip:completed', { trip_id });
        }

        console.log(`[Trip Complete] ${trip_id} | Rounds: ${roundsToday}`);

        res.json({
            success: true,
            message: 'à¸ªà¸´à¹‰à¸™à¸ªà¸¸à¸”à¸à¸²à¸£à¹€à¸”à¸´à¸™à¸—à¸²à¸‡ à¸žà¸£à¹‰à¸­à¸¡à¸£à¸±à¸šà¸£à¸­à¸šà¸–à¸±à¸”à¹„à¸›',
            trip_summary: {
                total_passengers: totalPassengers,
                departure_time: trip.departureTime,
                arrival_time: trip.arrivalTime,
                rounds_today: roundsToday
            },
            van_info: van ? {
                van_id: van._id,
                plate_number: van.plate_number,
                seat_capacity: van.seat_capacity,
                status: van.status
            } : null
        });

    } catch (error) {
        console.error('[Complete Error]', error);
        res.status(500).json({ success: false, error: 'à¸ªà¸´à¹‰à¸™à¸ªà¸¸à¸”à¸à¸²à¸£à¹€à¸”à¸´à¸™à¸—à¸²à¸‡à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

// ==================== DAILY SHIFT ====================

exports.getShiftStatus = async (req, res) => {
    try {
        const { driver_id } = req.params;
        const today = getTodayStr();
        const todayStart = new Date(today + 'T00:00:00');

        const van = await Van.findOne({
            current_driver_id: driver_id,
            last_active_date: today
        });

        const roundsToday = await Trip.countDocuments({
            driverId: driver_id,
            status: 'completed',
            completedAt: { $gte: todayStart }
        });

        const activeTrip = await Trip.findOne({
            driverId: driver_id,
            status: { $in: ['scheduled', 'departed'] }
        }).populate('route').populate('vanRef');

        res.json({
            success: true,
            shift: {
                has_van: !!van,
                van: van ? {
                    van_id: van._id,
                    plate_number: van.plate_number,
                    seat_capacity: van.seat_capacity,
                    status: van.status,
                    max_rounds: van.max_rounds_per_day
                } : null,
                rounds_today: roundsToday,
                active_trip: activeTrip ? {
                    trip_id: activeTrip._id,
                    route: activeTrip.route,
                    departure_time: activeTrip.departureTime,
                    status: activeTrip.status
                } : null,
                date: today
            }
        });

    } catch (error) {
        console.error('[ShiftStatus Error]', error);
        res.status(500).json({ success: false, error: 'à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸à¸°à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

exports.checkVanBinding = async (req, res) => {
    try {
        const { van_id } = req.params;
        const today = getTodayStr();

        const van = await Van.findById(van_id).populate('current_driver_id', 'name phone');
        if (!van) {
            return res.status(404).json({ success: false, error: 'à¹„à¸¡à¹ˆà¸žà¸šà¸£à¸–' });
        }

        const isBoundToday = van.current_driver_id && van.last_active_date === today;

        res.json({
            success: true,
            binding: {
                is_bound: isBoundToday,
                plate_number: van.plate_number,
                driver: isBoundToday ? {
                    id: van.current_driver_id._id,
                    name: van.current_driver_id.name,
                    phone: van.current_driver_id.phone
                } : null,
                status: van.status,
                date: today
            }
        });

    } catch (error) {
        console.error('[CheckBinding Error]', error);
        res.status(500).json({ success: false, error: 'à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸à¸²à¸£à¸œà¸¹à¸à¸£à¸–à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§' });
    }
};

exports.changeVan = async (req, res) => {
    try {
        const { driver_id, plate_number } = req.body;

        if (!driver_id || !plate_number) {
            return res.status(400).json({ success: false, error: 'à¸à¸£à¸¸à¸“à¸²à¸£à¸°à¸šà¸¸ driver_id à¹à¸¥à¸° plate_number' });
        }

        // Can't change van during active trip
        const activeTrip = await Trip.findOne({
            driver_id,
            status: { $in: ['scheduled', 'departed'] }
        });

        if (activeTrip) {
            return res.status(400).json({
                success: false,
                error: 'à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸£à¸–à¹„à¸”à¹‰à¸‚à¸“à¸°à¸¡à¸µà¸£à¸­à¸šà¸£à¸–à¸—à¸µà¹ˆà¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¹€à¸ªà¸£à¹‡à¸ˆ',
                code: 'ACTIVE_TRIP_EXISTS'
            });
        }

        const today = getTodayStr();
        const normalizedPlate = plate_number.trim();

        // Release old van
        await Van.updateMany(
            { current_driver_id: driver_id },
            { $set: { current_driver_id: null, driver_id: null, status: 'available' } }
        );

        // Check new van availability
        const targetVan = await Van.findOne({ plate_number: normalizedPlate });
        if (targetVan &&
            targetVan.current_driver_id &&
            targetVan.last_active_date === today &&
            targetVan.current_driver_id.toString() !== driver_id) {
            return res.status(400).json({
                success: false,
                error: 'à¸£à¸–à¸„à¸±à¸™à¸™à¸µà¹‰à¸–à¸¹à¸à¸œà¸¹à¸à¸à¸±à¸šà¸„à¸™à¸‚à¸±à¸šà¸—à¹ˆà¸²à¸™à¸­à¸·à¹ˆà¸™à¹à¸¥à¹‰à¸§à¸§à¸±à¸™à¸™à¸µà¹‰',
                code: 'VAN_BOUND_TODAY'
            });
        }

        // Bind new van
        const van = await Van.findOneAndUpdate(
            { plate_number: normalizedPlate },
            {
                $set: {
                    status: 'ready_for_next_trip',
                    driver_id: driver_id,
                    current_driver_id: driver_id,
                    last_active_date: today
                },
                $setOnInsert: {
                    seat_capacity: 13,
                    model: 'Toyota Commuter'
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await User.findByIdAndUpdate(driver_id, { vanNumber: normalizedPlate });

        console.log(`[Change Van] Driver ${driver_id} â†’ ${normalizedPlate}`);

        res.json({
            success: true,
            message: 'à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸£à¸–à¸ªà¸³à¹€à¸£à¹‡à¸ˆ',
            van: {
                van_id: van._id,
                plate_number: van.plate_number,
                seat_capacity: van.seat_capacity,
                status: van.status
            }
        });

    } catch (error) {
        console.error('[ChangeVan Error]', error);
        res.status(500).json({ success: false, error: 'à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸£à¸–à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ' });
    }
};


