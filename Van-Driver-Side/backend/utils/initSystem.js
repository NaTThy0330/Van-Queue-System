/**
 * System Initialization
 * Auto-creates fixed routes and daily trips on server start
 * Uses explicit Asia/Bangkok timezone for schedule consistency
 */

const Route = require('../models/Route');
const Trip = require('../models/Trip');

// ==================== TIMEZONE-SAFE HELPERS ====================

/**
 * Get Bangkok "today" boundaries regardless of system TZ
 * Returns { todayStart, todayEnd } as Date objects in UTC
 * that correspond to 00:00 and 23:59:59 Bangkok time
 */
const getBangkokToday = () => {
    const now = new Date();
    // Bangkok is UTC+7 — always (no DST)
    const bangkokOffset = 7 * 60; // minutes
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const bangkokMinutes = utcMinutes + bangkokOffset;

    // Bangkok date components
    let bangkokDate = new Date(now);
    bangkokDate.setUTCMinutes(bangkokDate.getUTCMinutes() + bangkokOffset);

    const year = bangkokDate.getUTCFullYear();
    const month = bangkokDate.getUTCMonth();
    const day = bangkokDate.getUTCDate();

    // todayStart = 00:00 Bangkok = 17:00 UTC (previous day)
    const todayStart = new Date(Date.UTC(year, month, day, 0, 0, 0) - bangkokOffset * 60000);
    // todayEnd = 23:59:59 Bangkok
    const todayEnd = new Date(Date.UTC(year, month, day, 23, 59, 59) - bangkokOffset * 60000);

    return { todayStart, todayEnd, year, month, day };
};

/**
 * Create a Date for a specific Bangkok time today
 * e.g., bangkokTime(5, 30) = today at 05:30 Bangkok time
 */
const bangkokTime = (hour, minute) => {
    const { year, month, day } = getBangkokToday();
    // Bangkok hour:minute → UTC
    return new Date(Date.UTC(year, month, day, hour - 7, minute, 0));
};

// ==================== ROUTE DEFINITIONS ====================

const ROUTE_DEFINITIONS = [
    {
        routeCode: 'route_mochit',
        routeName: 'มธ. ศูนย์รังสิต → หมอชิต',
        origin: 'มธ. ศูนย์รังสิต',
        destination: 'หมอชิต',
        durationMinutes: 45,
        destinationLat: 13.8027,
        destinationLng: 100.5535
    },
    {
        routeCode: 'route_victory',
        routeName: 'มธ. ศูนย์รังสิต → อนุสาวรีย์ชัยฯ',
        origin: 'มธ. ศูนย์รังสิต',
        destination: 'อนุสาวรีย์ชัยสมรภูมิ',
        durationMinutes: 50,
        destinationLat: 13.7649,
        destinationLng: 100.5382
    },
    {
        routeCode: 'route_future',
        routeName: 'มธ. ศูนย์รังสิต → ฟิวเจอร์พาร์ค รังสิต',
        origin: 'มธ. ศูนย์รังสิต',
        destination: 'ฟิวเจอร์พาร์ค รังสิต',
        durationMinutes: 30,
        destinationLat: 13.9901,
        destinationLng: 100.6154
    }
];

// ==================== STATIC SCHEDULE ====================
// Hardcoded timetable — identical in local and cloud

const SCHEDULE = [
    // Mo Chit: 05:30 – 20:30 every 30 min (31 slots)
    { routeCode: 'route_mochit', startH: 5, startM: 30, endH: 20, endM: 30, interval: 30 },
    // Victory Monument: 05:30 – 20:30 every 30 min (31 slots)
    { routeCode: 'route_victory', startH: 5, startM: 30, endH: 20, endM: 30, interval: 30 },
    // Future Park: 07:00 – 20:00 every 30 min (27 slots)
    { routeCode: 'route_future', startH: 7, startM: 0, endH: 20, endM: 0, interval: 30 },
];

// ==================== INIT ROUTES ====================

const initRoutes = async () => {
    try {
        console.log('Ensuring fixed routes...');

        for (const def of ROUTE_DEFINITIONS) {
            await Route.findOneAndUpdate(
                { origin: def.origin, destination: def.destination },
                {
                    $set: {
                        routeCode: def.routeCode,
                        routeName: def.routeName,
                        durationMinutes: def.durationMinutes,
                        destinationLat: def.destinationLat,
                        destinationLng: def.destinationLng
                    },
                    $setOnInsert: {
                        origin: def.origin,
                        destination: def.destination
                    }
                },
                { upsert: true, new: true }
            );
        }

        // Backfill human-readable name for any remaining routes
        await Route.updateMany(
            { routeName: { $in: [null, ''] } },
            [{ $set: { routeName: { $concat: ['$origin', ' -> ', '$destination'] } } }]
        );

        console.log('Fixed routes ensured.');
    } catch (error) {
        console.error('Init Error (Routes):', error);
    }
};

// ==================== INIT DAILY TRIPS ====================

const initDailyTrips = async () => {
    try {
        const { todayStart, todayEnd } = getBangkokToday();

        console.log('Generating daily trips (Bangkok timezone)...');

        // Load routes
        const routeMap = {};
        for (const def of ROUTE_DEFINITIONS) {
            const route = await Route.findOne({ routeCode: def.routeCode });
            if (route) routeMap[def.routeCode] = route;
        }

        const tripsToInsert = [];

        // Strict static timetable generation - Fill missing slots only
        for (const sched of SCHEDULE) {
            const route = routeMap[sched.routeCode];
            if (!route) continue;

            let h = sched.startH;
            let m = sched.startM;

            while (h < sched.endH || (h === sched.endH && m <= sched.endM)) {
                const tripTime = bangkokTime(h, m);

                // Check if this exact slot already exists to prevent overwriting booked trips
                const exists = await Trip.exists({
                    route: route._id,
                    departureTime: tripTime
                });

                if (!exists) {
                    tripsToInsert.push({
                        route: route._id,
                        departureTime: tripTime,
                        seatCapacity: 13,
                        availableSeats: 13,
                        status: 'scheduled',
                        vanRef: null,
                        driverId: null
                    });
                }

                // Advance by interval
                m += sched.interval;
                if (m >= 60) {
                    h += Math.floor(m / 60);
                    m = m % 60;
                }
            }
        }

        if (tripsToInsert.length > 0) {
            await Trip.insertMany(tripsToInsert);
            console.log(`Generated ${tripsToInsert.length} missing trips for today.`);
        } else {
            console.log('All 89 slots for today already exist. No new trips generated.');
        }
    } catch (error) {
        console.error('Init Error (Trips):', error);
    }
};

// ==================== RESET DAILY BINDINGS ====================

const resetDailyBindings = async () => {
    try {
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        const Van = require('../models/Van');

        const result = await Van.updateMany(
            {
                current_driverId: { $ne: null },
                last_active_date: { $ne: today }
            },
            {
                $set: {
                    current_driverId: null,
                    driverId: null,
                    status: 'available',
                    last_active_date: null
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`Reset ${result.modifiedCount} stale van binding(s).`);
        }
    } catch (error) {
        console.error('Init Error (Reset Bindings):', error);
    }
};

// ==================== MAIN ====================

const initSystem = async () => {
    console.log('Starting system initialization...');
    await initRoutes();
    await initDailyTrips();
    await resetDailyBindings();
    console.log('System initialization complete.');
};

module.exports = { initSystem };
