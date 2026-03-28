/**
 * ============================================================
 * 🚐 Van Queue - Backbone Schedule Seed
 * ============================================================
 * 
 * สร้างตารางเดินรถสำหรับระบบรถตู้ธรรมศาสตร์
 * 
 * เส้นทาง 
 *   1. มธ. ศูนย์รังสิต → หมอชิต
 *   2. มธ. ศูนย์รังสิต → อนุสาวรีย์ชัยฯ
 *   3. มธ. ศูนย์รังสิต → ฟิวเจอร์พาร์ค รังสิต
 * 
 * ตารางเวลา:
 *   - หมอชิต & อนุสาวรีย์: 05:30 - 20:30 (ทุก 30 นาที)
 *   - ฟิวเจอร์พาร์ค: 07:00 - 20:00 (ทุก 30 นาที)
 * 
 * รัน: node scripts/seed.js
 * ============================================================
 */

const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
    startOfDay,
    setHours,
    setMinutes,
    addMinutes,
    format,
    isBefore,
    isEqual
} = require('date-fns');

// ==================== CONFIG ====================
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/van_queue';

// ==================== MODELS (use actual project models) ====================
const User = require('../models/User');
const Van = require('../models/Van');
const Route = require('../models/Route');
const Trip = require('../models/Trip');

// ==================== ROUTE DEFINITIONS (HARDCODED) ====================
const ROUTE_DEFINITIONS = {
    mochit: {
        routeCode: 'route_mochit',
        routeName: 'มธ. ศูนย์รังสิต → หมอชิต',
        origin: 'มธ. ศูนย์รังสิต',
        destination: 'หมอชิต',
        durationMinutes: 45
    },
    victory: {
        routeCode: 'route_victory',
        routeName: 'มธ. ศูนย์รังสิต → อนุสาวรีย์ชัยฯ',
        origin: 'มธ. ศูนย์รังสิต',
        destination: 'อนุสาวรีย์ชัยสมรภูมิ',
        durationMinutes: 50
    },
    future: {
        routeCode: 'route_future',
        routeName: 'มธ. ศูนย์รังสิต → ฟิวเจอร์พาร์ค รังสิต',
        origin: 'มธ. ศูนย์รังสิต',
        destination: 'ฟิวเจอร์พาร์ค รังสิต',
        durationMinutes: 30
    }
};

// ==================== SCHEDULE DEFINITIONS (HARDCODED) ====================
const SCHEDULE_CONFIG = {
    mochit: { startHour: 5, startMin: 30, endHour: 20, endMin: 30, intervalMinutes: 30 },
    victory: { startHour: 5, startMin: 30, endHour: 20, endMin: 30, intervalMinutes: 30 },
    future: { startHour: 7, startMin: 0, endHour: 20, endMin: 0, intervalMinutes: 30 }
};

// ==================== SCHEDULE GENERATOR ====================
/**
 * Generate trip schedules for today using date-fns
 * @param {ObjectId} routeId - Route ObjectId
 * @param {Object} config - Schedule configuration
 * @returns {Array} Array of trip objects
 */
function generateTripSchedule(routeId, config) {
    const { startHour, startMin, endHour, endMin, intervalMinutes } = config;
    const trips = [];

    // Get today's date at midnight
    const today = startOfDay(new Date());

    // Create start and end times
    let startTime = setMinutes(setHours(today, startHour), startMin);
    const endTime = setMinutes(setHours(today, endHour), endMin);

    // Loop and generate trips
    let currentTime = startTime;
    while (isBefore(currentTime, endTime) || isEqual(currentTime, endTime)) {
        trips.push({
            route: routeId,
            departureTime: new Date(currentTime),
            status: 'scheduled',
            seatCapacity: 13,
            availableSeats: 13,
            vanRef: null,
            driverId: null
        });

        // Move to next slot
        currentTime = addMinutes(currentTime, intervalMinutes);
    }

    return trips;
}

/**
 * Print schedule preview
 */
function printSchedulePreview(trips, routeName) {
    const times = trips.map(t => format(t.departureTime, 'HH:mm'));
    console.log(`   ✓ ${routeName}`);
    console.log(`     ${times.slice(0, 5).join(' → ')} ... ${times.slice(-2).join(' → ')}`);
    console.log(`     Total: ${trips.length} รอบ`);
}

// ==================== MAIN SEED FUNCTION ====================
async function seed() {
    try {
        console.log('\n' + '═'.repeat(60));
        console.log('  🚐 VAN QUEUE - BACKBONE SCHEDULE SEED');
        console.log('═'.repeat(60) + '\n');

        console.log('� CDriver@123to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to:', MONGODB_URI.split('@')[1] || MONGODB_URI);

        // ===== Step 1: Create Fixed Routes =====
        console.log('\n� Step 1: Creating Fixed Routes...\n');

        // Clear old routes
        await Route.deleteMany({});

        const routeIds = {};
        for (const [key, routeDef] of Object.entries(ROUTE_DEFINITIONS)) {
            const created = await Route.findOneAndUpdate(
                { routeCode: routeDef.routeCode },
                routeDef,
                { upsert: true, new: true }
            );
            routeIds[key] = created._id;
            console.log(`   ✓ [${routeDef.routeCode}] ${routeDef.routeName}`);
        }

        // ===== Step 2: Generate Trip Schedules =====
        console.log('\n🕐 Step 2: Generating Trip Schedules for Today...\n');
        console.log(`   Date: ${format(new Date(), 'dd/MM/yyyy')}\n`);

        // Clear old trips for today
        const todayStart = startOfDay(new Date());
        const todayEnd = addMinutes(todayStart, 24 * 60 - 1);
        await Trip.deleteMany({
            departureTime: { $gte: todayStart, $lte: todayEnd }
        });

        // Generate for each route
        let totalTrips = 0;

        // Mochit: 05:30 - 20:30
        const mochitTrips = generateTripSchedule(routeIds.mochit, SCHEDULE_CONFIG.mochit);
        await Trip.insertMany(mochitTrips);
        printSchedulePreview(mochitTrips, 'หมอชิต (05:30 - 20:30)');
        totalTrips += mochitTrips.length;

        console.log('');

        // Victory Monument: 05:30 - 20:30
        const victoryTrips = generateTripSchedule(routeIds.victory, SCHEDULE_CONFIG.victory);
        await Trip.insertMany(victoryTrips);
        printSchedulePreview(victoryTrips, 'อนุสาวรีย์ชัยฯ (05:30 - 20:30)');
        totalTrips += victoryTrips.length;

        console.log('');

        // Future Park: 07:00 - 20:00 (later start)
        const futureTrips = generateTripSchedule(routeIds.future, SCHEDULE_CONFIG.future);
        await Trip.insertMany(futureTrips);
        printSchedulePreview(futureTrips, 'ฟิวเจอร์พาร์ค (07:00 - 20:00)');
        totalTrips += futureTrips.length;

        // ===== Step 3: Create Vans =====
        console.log('\n🚐 Step 3: Creating Available Vans...\n');

        const vanPlates = ['10-0001', '10-0002', '10-0003', '10-0004', '10-0005'];
        for (const plate of vanPlates) {
            await Van.findOneAndUpdate(
                { plate_number: plate },
                {
                    plate_number: plate,
                    seat_capacity: 13,
                    model: 'Toyota Commuter',
                    status: 'available',
                    driverId: null
                },
                { upsert: true, new: true }
            );
            console.log(`   ✓ ${plate} (13 ที่นั่ง, available)`);
        }

        // ===== Step 4: Create Test Drivers =====
        console.log('\n👤 Step 4: Creating Test Drivers...\n');

        const hashedPassword = await bcrypt.hash('Driver@123', 10);
        const testDrivers = [
            { name: 'คนขับ ทดสอบ 1', phone: '0811111111', license_no: 'DRV-001', email: 'driver1@example.com' },
            { name: 'คนขับ ทดสอบ 2', phone: '0822222222', license_no: 'DRV-002', email: 'driver2@example.com' },
            { name: 'คนขับ ทดสอบ 3', phone: '0833333333', license_no: 'DRV-003', email: 'driver3@example.com' }
        ];

        for (const driver of testDrivers) {
            await User.findOneAndUpdate(
                { phone: driver.phone },
                {
                    ...driver,
                    password_hash: hashedPassword,
                    role: 'driver'
                },
                { upsert: true, new: true }
            );
            console.log(`   ✓ ${driver.name} (${driver.phone})`);
        }

        // ===== Summary =====
        console.log('\n' + '═'.repeat(60));
        console.log('  ✅ SEED COMPLETED SUCCESSFULLY!');
        console.log('═'.repeat(60));
        console.log('\n📊 Summary:');
        console.log(`   ├─ Routes: 3 เส้นทาง`);
        console.log(`   ├─ Trips: ${totalTrips} รอบ/วัน`);
        console.log(`   │    ├─ หมอชิต: ${mochitTrips.length} รอบ`);
        console.log(`   │    ├─ อนุสาวรีย์: ${victoryTrips.length} รอบ`);
        console.log(`   │    └─ ฟิวเจอร์: ${futureTrips.length} รอบ`);
        console.log(`   ├─ Vans: ${vanPlates.length} คัน`);
        console.log(`   └─ Drivers: ${testDrivers.length} คน`);
        console.log('\n📱 Test Login:');
        console.log('   Phone: 0811111111');
        console.log('   Password: Driver@123');
        console.log('\n' + '═'.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Seed Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB\n');
        process.exit(0);
    }
}

// Run seed
seed();


