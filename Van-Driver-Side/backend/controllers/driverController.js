/**
 * Driver Controller
 * Auth, Profile, Van Selection, Trips, Walk-in, EndTrip
 * Fixed: Thai encoding, ticketCode generation, dashboard stats
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
const Booking = require('../models/Booking');

const JWT_SECRET = process.env.JWT_SECRET || 'van-queue-secret-key-2026';

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Generate a unique ticket code
 * Walk-in: W-XXXX, Online: uses ticketCode from client or falls back to queue ID
 */
const generateTicketCode = (prefix = 'W') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${code}`;
};

// ==================== AUTH ====================

exports.register = async (req, res) => {
    try {
        const { name, phone, license_no, password } = req.body;

        if (!name || !phone || !license_no || !password) {
            return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' });
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, error: 'เบอร์โทรศัพท์ไม่ถูกต้อง' });
        }

        const existingByPhone = await User.findOne({ phone });
        if (existingByPhone) {
            return res.status(409).json({ success: false, error: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' });
        }

        const existingByLicense = await User.findOne({ license_no });
        if (existingByLicense) {
            return res.status(409).json({ success: false, error: 'เลขใบขับขี่นี้ถูกใช้งานแล้ว' });
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
            message: 'ลงทะเบียนสำเร็จ',
            driver_id: newDriver._id
        });

    } catch (error) {
        console.error('[Register Error]', error);
        res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
    }
};

exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ success: false, error: 'กรุณากรอกเบอร์โทรและรหัสผ่าน' });
        }

        const driver = await User.findOne({ phone });

        if (!driver || driver.role !== 'driver') {
            return res.status(401).json({ success: false, error: 'หมายเลขโทรศัพท์หรือรหัสผ่านไม่ถูกต้อง' });
        }

        // Support both password and password_hash fields
        const storedPassword = driver.password || driver.password_hash;
        if (!storedPassword) {
            return res.status(401).json({ success: false, error: 'บัญชีนี้ไม่มีรหัสผ่าน กรุณาลงทะเบียนใหม่' });
        }

        const isMatch = await bcrypt.compare(password, storedPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'หมายเลขโทรศัพท์หรือรหัสผ่านไม่ถูกต้อง' });
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
        res.status(500).json({ success: false, error: 'เข้าสู่ระบบล้มเหลว' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const driverId = req.driver?.id || req.params.id;

        const driver = await User.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลคนขับ' });
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
        res.status(500).json({ success: false, error: 'ดึงข้อมูลล้มเหลว' });
    }
};

// ==================== VAN SELECTION ====================

exports.getAvailableVans = async (req, res) => {
    try {
        const vans = await Van.find({ status: 'available' });
        res.json({ success: true, vans });
    } catch (error) {
        console.error('[Vans Error]', error);
        res.status(500).json({ success: false, error: 'ดึงข้อมูลรถล้มเหลว' });
    }
};

/**
 * Select Van (Start Shift) — Dynamic Upsert with daily binding
 */
exports.selectVan = async (req, res) => {
    try {
        const { driver_id, plate_number } = req.body;

        if (!driver_id || !plate_number) {
            return res.status(400).json({ success: false, error: 'กรุณาระบุ driver_id และ plate_number' });
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
                error: 'รถคันนี้ถูกผูกกับคนขับท่านอื่นแล้ววันนี้',
                code: 'VAN_BOUND_TODAY'
            });
        }

        // Check on-duty by another driver
        if (existingVan && existingVan.status === 'on-duty' && existingVan.driver_id?.toString() !== driver_id) {
            return res.status(400).json({
                success: false,
                error: 'รถคันนี้กำลังใช้งานโดยคนขับท่านอื่น (สถานะ: on-duty)',
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

        console.log(`[Van Selected] ${normalizedPlate} → Driver: ${driver_id}`);

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
        res.status(500).json({ success: false, error: 'เลือกรถไม่สำเร็จ' });
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
        res.status(500).json({ success: false, error: 'ดึงข้อมูลรอบรถล้มเหลว' });
    }
};

exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find();
        res.json({ success: true, routes });
    } catch (error) {
        console.error('[Routes Error]', error);
        res.status(500).json({ success: false, error: 'ดึงข้อมูลเส้นทางล้มเหลว' });
    }
};

exports.createTrip = async (req, res) => {
    try {
        const { driver_id, van_id, route_id, departure_time } = req.body;

        if (!driver_id || !route_id || !departure_time) {
            return res.status(400).json({ success: false, error: 'กรุณาระบุ driver_id, route_id และ departure_time' });
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
            return res.status(400).json({ success: false, error: 'กรุณาเลือกรถก่อน', code: 'NO_VAN' });
        }

        const existing = await Trip.findOne({
            driverId: driver_id,
            status: { $in: ['scheduled', 'departed'] }
        });

        if (existing) {
            return res.status(400).json({ success: false, error: 'คุณมีรอบรถที่ยังไม่เสร็จสิ้น', code: 'TRIP_EXISTS' });
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
        res.status(500).json({ success: false, error: 'สร้างรอบรถล้มเหลว' });
    }
};

/**
 * Assign Trip — bind an existing scheduled trip to this driver+van
 * Called by TripList when driver selects a pre-generated trip slot
 */
exports.assignTrip = async (req, res) => {
    try {
        const { trip_id } = req.params;
        const { driver_id, van_id } = req.body;

        if (!driver_id) {
            return res.status(400).json({ success: false, error: 'กรุณาระบุ driver_id' });
        }

        // Check driver doesn't already have an active trip
        const existingTrip = await Trip.findOne({
            driverId: driver_id,
            status: { $in: ['scheduled', 'departed'] }
        });
        if (existingTrip) {
            return res.status(400).json({ success: false, error: 'คุณมีรอบรถที่ยังไม่เสร็จสิ้น', code: 'TRIP_EXISTS' });
        }

        // Find trip and check it's still available
        const trip = await Trip.findOne({
            _id: trip_id,
            status: 'scheduled',
            driverId: null
        });
        if (!trip) {
            return res.status(404).json({ success: false, error: 'ไม่พบรอบรถนี้ หรือถูกเลือกไปแล้ว', code: 'TRIP_NOT_AVAILABLE' });
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
            return res.status(400).json({ success: false, error: 'กรุณาเลือกรถก่อน', code: 'NO_VAN' });
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

        console.log(`[AssignTrip] Trip ${trip_id} → Driver ${driver_id}`);

        res.json({ success: true, trip: populatedTrip });

    } catch (error) {
        console.error('[AssignTrip Error]', error);
        res.status(500).json({ success: false, error: 'เลือกรอบรถล้มเหลว' });
    }
};

// ==================== PAYMENTS ====================

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
                select: 'passengerName queueType paymentStatus trip ticketCode'
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
                passenger_name: q.passengerName || 'ไม่ระบุชื่อ',
                amount: 0,
                slip_url: null,
                queue_type: q.queueType,
                payment_status: q.paymentStatus,
                ticket_code: q.ticketCode || q._id?.toString().slice(-4).toUpperCase()
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
                    ticket_code: p.queue?.ticketCode || p.queue?._id?.toString().slice(-4).toUpperCase(),
                    queue_id: p.queue ? {
                        _id: p.queue._id,
                        passenger_name: p.queue.passengerName
                    } : null
                })),
            ...pendingBookings.map(b => ({
                _id: b._id,
                source: 'booking',
                passenger_name: b.passengerName || 'ไม่ระบุชื่อ',
                amount: 0,
                slip_url: b.paymentSlip ? `/uploads/slips/${b.paymentSlip}` : null,
                payment_status: b.paymentStatus,
                ticket_code: b._id?.toString().slice(-4).toUpperCase()
            }))
        ];

        res.json({ success: true, payments });

    } catch (error) {
        console.error('[GetPayments Error]', error);
        res.status(500).json({ success: false, error: 'ดึงข้อมูลการชำระเงินล้มเหลว' });
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
            return res.status(400).json({ success: false, error: 'action ต้องเป็น approve หรือ reject' });
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
                    queue.cancelReason = reason || 'สลิปถูกปฏิเสธ';
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

        return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลการชำระเงิน' });

    } catch (error) {
        console.error('[VerifyPayment Error]', error);
        res.status(500).json({ success: false, error: 'ยืนยันการชำระเงินล้มเหลว' });
    }
};

/**
 * Get Current Trip — prioritize 'departed' over 'scheduled'
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

        // Compute stats
        const waitingCheckIn = passengers.filter(p => p.status === 'pending' || p.status === 'confirmed').length;
        const checkedIn = passengers.filter(p => p.status === 'checked_in').length;
        const totalTicketsSold = passengers.length;

        // Count pending payments
        const pendingPaymentsCount = await Payment.countDocuments({
            status: 'pending',
            queue: { $in: passengers.map(p => p._id) }
        });

        // Count unpaid online queues
        const unpaidOnlineCount = passengers.filter(p => p.queueType === 'online_unpaid' && p.paymentStatus === 'unpaid').length;

        res.json({
            success: true,
            trip,
            passengers,
            stats: {
                waitingCheckIn,
                checkedIn,
                totalTicketsSold,
                pendingPayments: pendingPaymentsCount + unpaidOnlineCount
            }
        });

    } catch (error) {
        console.error('[GetCurrentTrip Error]', error);
        res.status(500).json({ success: false, error: 'ดึงข้อมูลรอบรถไม่สำเร็จ' });
    }
};

// ==================== DASHBOARD STATS ====================

exports.getDashboardStats = async (req, res) => {
    try {
        const { trip_id } = req.params;

        const passengers = await Queue.find({
            trip: trip_id,
            status: { $nin: ['cancelled', 'expired', 'no_show'] }
        });

        const waitingCheckIn = passengers.filter(p => p.status === 'pending' || p.status === 'confirmed').length;
        const checkedIn = passengers.filter(p => p.status === 'checked_in').length;
        const totalTicketsSold = passengers.length;
        const onlineCount = passengers.filter(p => p.queueType !== 'walkin').length;
        const walkinCount = passengers.filter(p => p.queueType === 'walkin').length;

        // Count pending payments
        const pendingPaymentsCount = await Payment.countDocuments({
            status: 'pending',
            queue: { $in: passengers.map(p => p._id) }
        });

        const unpaidOnlineCount = passengers.filter(p => p.queueType === 'online_unpaid' && p.paymentStatus === 'unpaid').length;

        res.json({
            success: true,
            stats: {
                waitingCheckIn,
                checkedIn,
                totalTicketsSold,
                onlineCount,
                walkinCount,
                pendingPayments: pendingPaymentsCount + unpaidOnlineCount
            }
        });
    } catch (error) {
        console.error('[DashboardStats Error]', error);
        res.status(500).json({ success: false, error: 'ดึงสถิติล้มเหลว' });
    }
};

// ==================== QUICK WALK-IN (ATOMIC) ====================

/**
 * Quick Walk-in — atomic $inc to prevent race conditions
 * Enforces 50% walk-in quota
 */
exports.quickWalkin = async (req, res) => {
    try {
        const { trip_id } = req.body;

        if (!trip_id) {
            return res.status(400).json({ success: false, error: 'กรุณาระบุ trip_id' });
        }

        // Check walk-in quota (strict 50%)
        const tripCheck = await Trip.findById(trip_id);
        if (!tripCheck) {
            return res.status(404).json({ success: false, error: 'ไม่พบรอบรถ' });
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
                error: `โควตา Walk-in เต็มแล้ว (จำกัด ${maxWalkIn} ที่นั่ง)`,
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
            return res.status(400).json({ success: false, error: 'ไม่มีที่นั่งว่างหรือไม่พบรอบรถ', code: 'NO_SEATS' });
        }

        const seatNumber = trip.seatCapacity - trip.availableSeats;
        const ticketCode = generateTicketCode('W');

        // Count total queue numbers (online + walkin) for unified numbering
        const totalQueues = await Queue.countDocuments({
            trip: trip_id,
            status: { $ne: 'cancelled' }
        });

        const queueEntry = new Queue({
            trip: trip_id,
            passengerName: `Walk-in #${seatNumber}`,
            seatCount: 1,
            queueType: 'walkin',
            bookingSource: 'walkin',
            status: 'checked_in',
            paymentStatus: 'paid',
            ticketCode: ticketCode
        });
        await queueEntry.save();

        // Real-time socket update
        const io = req.app.get('io');
        if (io) {
            io.to(`trip-${trip_id}`).emit('seat:updated', { trip_id, available_seats: trip.availableSeats });
            io.to(`trip-${trip_id}`).emit('booking:added', {
                queue_id: queueEntry._id,
                passenger_name: queueEntry.passengerName,
                type: 'walkin',
                ticket_code: ticketCode
            });
        }

        console.log(`[Walk-in] #${seatNumber} (${ticketCode}), Remaining: ${trip.availableSeats}`);

        res.json({
            success: true,
            queue: {
                queue_id: queueEntry._id,
                passenger_name: queueEntry.passengerName,
                seat_number: seatNumber,
                queue_number: totalQueues,
                ticket_code: ticketCode,
                status: 'checked_in'
            },
            available_seats: trip.availableSeats
        });

    } catch (error) {
        console.error('[Walk-in Error]', error);
        res.status(500).json({ success: false, error: 'เพิ่ม Walk-in ล้มเหลว' });
    }
};

// ==================== NO-SHOW CLEARANCE ====================

// Bulk cancel pending passengers who haven't checked in
exports.clearNoShow = async (req, res) => {
    try {
        const { trip_id } = req.params;

        const trip = await Trip.findById(trip_id);
        if (!trip) {
            return res.status(404).json({ success: false, error: 'ไม่พบรอบรถ' });
        }

        // Find all pending (not checked-in) passengers
        const pendingQueues = await Queue.find({
            trip: trip_id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (pendingQueues.length === 0) {
            return res.status(400).json({ success: false, error: 'ไม่มีผู้โดยสารที่ยังไม่มา' });
        }

        // Calculate total seats to release
        const seatsToRelease = pendingQueues.reduce((sum, q) => sum + (q.seatCount || 1), 0);

        // Bulk update all pending to no_show
        await Queue.updateMany(
            { trip: trip_id, status: { $in: ['pending', 'confirmed'] } },
            { $set: { status: 'no_show', cancelReason: 'ไม่มาเช็กอิน (No-show)' } }
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
        res.status(500).json({ success: false, error: 'เคลียร์ที่นั่งล้มเหลว' });
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

        // Enrich with ticket codes — use existing ticketCode or fallback to ID-based
        const enriched = passengers.map(p => {
            const obj = p.toJSON();
            obj.ticket_code = p.ticketCode || p._id?.toString().slice(-4).toUpperCase();
            return obj;
        });

        res.json({ success: true, passengers: enriched });
    } catch (error) {
        console.error('[Passengers Error]', error);
        res.status(500).json({ success: false, error: 'ดึงข้อมูลผู้โดยสารล้มเหลว' });
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
            return res.status(404).json({ success: false, error: 'ไม่พบข้อมูล' });
        }

        res.json({ success: true, queue });
    } catch (error) {
        console.error('[CheckIn Error]', error);
        res.status(500).json({ success: false, error: 'เช็กอินล้มเหลว' });
    }
};

exports.cancelPassenger = async (req, res) => {
    try {
        const { queue_id } = req.params;
        const { reason } = req.body;

        const queue = await Queue.findById(queue_id);
        if (!queue) {
            return res.status(404).json({ success: false, error: 'ไม่พบข้อมูล' });
        }

        if (queue.status === 'cancelled') {
            return res.status(400).json({ success: false, error: 'ตั๋วนี้ถูกยกเลิกไปแล้ว' });
        }

        queue.status = 'cancelled';
        queue.cancelReason = reason || 'ยกเลิกโดยคนขับ';
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
        res.status(500).json({ success: false, error: 'ยกเลิกล้มเหลว' });
    }
};

// ==================== TRIP STATUS ====================

exports.sendDepartureNotification = async (req, res) => {
    try {
        const { trip_id } = req.params;

        // Get trip info for notification message
        const trip = await Trip.findById(trip_id).populate('route');
        const routeName = trip?.route?.route_name || trip?.route?.origin || 'รถตู้';
        const departureTimeStr = trip?.departureTime
            ? new Date(trip.departureTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            : '';

        // Socket notification to connected clients
        const io = req.app.get('io');
        if (io) {
            // Room-specific (for driver-side listeners)
            io.to(`trip-${trip_id}`).emit('notify-departure', {
                trip_id,
                message: `รถ ${routeName} ใกล้ออกแล้ว กรุณาเตรียมตัวขึ้นรถ`
            });
            // Global broadcast (for passenger-side listeners)
            io.emit('departure:alert', {
                trip_id,
                route: routeName,
                departure_time: departureTimeStr,
                title: '🚐 รถใกล้ออกแล้ว!',
                message: `รถ ${routeName} เวลา ${departureTimeStr} น. ใกล้ออกแล้ว กรุณาเตรียมตัวขึ้นรถครับ`
            });
        }

        // Try FCM push notifications to all passengers
        try {
            const notificationService = require('../services/notificationService');
            const passengers = await Queue.find({
                trip: trip_id,
                status: { $in: ['pending', 'confirmed'] }
            }).populate('passenger');

            let sentCount = 0;
            for (const q of passengers) {
                if (q.passenger?.fcmToken) {
                    await notificationService.sendToDevice(
                        q.passenger.fcmToken,
                        '🔔 รถใกล้ออกแล้ว!',
                        `รถ ${routeName} เวลา ${departureTimeStr} น. ใกล้ออกแล้ว กรุณามาที่ท่ารถ`,
                        { type: 'departure_notice', tripId: trip_id }
                    );
                    sentCount++;
                }
            }

            console.log(`[Notify] Trip ${trip_id}: notified ${sentCount} passengers via FCM`);
        } catch (fcmErr) {
            console.warn('[Notify] FCM not available, socket-only notification sent');
        }

        res.json({ success: true, notifications_sent: true });
    } catch (error) {
        console.error('[Notify Error]', error);
        res.status(500).json({ success: false, error: 'ส่งการแจ้งเตือนล้มเหลว' });
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
            return res.status(404).json({ success: false, error: 'ไม่พบรอบรถ' });
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
        res.status(500).json({ success: false, error: 'ยืนยันการออกเดินทางล้มเหลว' });
    }
};

// Abandon Trip — undo trip selection if no passengers yet
exports.abandonTrip = async (req, res) => {
    try {
        const { trip_id } = req.params;

        const trip = await Trip.findById(trip_id);
        if (!trip) {
            return res.status(404).json({ success: false, error: 'ไม่พบรอบรถ' });
        }

        if (trip.status !== 'scheduled') {
            return res.status(400).json({ success: false, error: 'ไม่สามารถยกเลิกรอบที่ออกเดินทางแล้ว' });
        }

        // Check if any passengers exist
        const passengerCount = await Queue.countDocuments({
            trip: trip_id,
            status: { $ne: 'cancelled' }
        });

        if (passengerCount > 0) {
            return res.status(400).json({
                success: false,
                error: `มีผู้โดยสาร ${passengerCount} คนแล้ว ไม่สามารถยกเลิกได้`
            });
        }

        // Clear driver/van binding from trip — reset to available slot
        trip.driverId = null;
        trip.vanRef = null;
        trip.status = 'scheduled';
        trip.availableSeats = trip.seatCapacity;
        await trip.save();

        console.log(`[Abandon] Trip ${trip_id} released by driver`);

        res.json({ success: true, message: 'ยกเลิกรอบรถสำเร็จ' });
    } catch (error) {
        console.error('[Abandon Error]', error);
        res.status(500).json({ success: false, error: 'ยกเลิกรอบรถล้มเหลว' });
    }
};

/**
 * Complete Trip — set van to 'ready_for_next_trip' (keep driver binding)
 */
exports.completeTrip = async (req, res) => {
    try {
        const { trip_id } = req.params;
        const { final_location } = req.body;

        const trip = await Trip.findById(trip_id);
        if (!trip) {
            return res.status(404).json({ success: false, error: 'ไม่พบรอบรถ' });
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
            message: 'สิ้นสุดการเดินทาง พร้อมรับรอบถัดไป',
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
        res.status(500).json({ success: false, error: 'สิ้นสุดการเดินทางล้มเหลว' });
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
        res.status(500).json({ success: false, error: 'ดึงข้อมูลกะล้มเหลว' });
    }
};

exports.checkVanBinding = async (req, res) => {
    try {
        const { van_id } = req.params;
        const today = getTodayStr();

        const van = await Van.findById(van_id).populate('current_driver_id', 'name phone');
        if (!van) {
            return res.status(404).json({ success: false, error: 'ไม่พบรถ' });
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
        res.status(500).json({ success: false, error: 'ตรวจสอบการผูกรถล้มเหลว' });
    }
};

exports.changeVan = async (req, res) => {
    try {
        const { driver_id, plate_number } = req.body;

        if (!driver_id || !plate_number) {
            return res.status(400).json({ success: false, error: 'กรุณาระบุ driver_id และ plate_number' });
        }

        // Can't change van during active trip
        const activeTrip = await Trip.findOne({
            driver_id,
            status: { $in: ['scheduled', 'departed'] }
        });

        if (activeTrip) {
            return res.status(400).json({
                success: false,
                error: 'ไม่สามารถเปลี่ยนรถได้ขณะมีรอบรถที่ยังไม่เสร็จ',
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
                error: 'รถคันนี้ถูกผูกกับคนขับท่านอื่นแล้ววันนี้',
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

        console.log(`[Change Van] Driver ${driver_id} → ${normalizedPlate}`);

        res.json({
            success: true,
            message: 'เปลี่ยนรถสำเร็จ',
            van: {
                van_id: van._id,
                plate_number: van.plate_number,
                seat_capacity: van.seat_capacity,
                status: van.status
            }
        });

    } catch (error) {
        console.error('[ChangeVan Error]', error);
        res.status(500).json({ success: false, error: 'เปลี่ยนรถไม่สำเร็จ' });
    }
};
