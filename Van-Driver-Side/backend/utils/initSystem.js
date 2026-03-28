/**
 * System Initialization
 * Auto-creates fixed routes and daily trips on server start
 */
const { startOfDay, setHours, setMinutes, addMinutes, isBefore, isEqual } = require('date-fns');

const Route = require('../models/Route');
const Trip = require('../models/Trip');

const ROUTE_DEFINITIONS = [
    {
        routeCode: 'route_mochit',
        routeName: 'ธรรมศาสตร์ รังสิต -> หมอชิต',
        origin: 'ธรรมศาสตร์ รังสิต',
        destination: 'หมอชิต',
        durationMinutes: 45
    },
    {
        routeCode: 'route_victory',
        routeName: 'ธรรมศาสตร์ รังสิต -> อนุสาวรีย์',
        origin: 'ธรรมศาสตร์ รังสิต',
        destination: 'อนุสาวรีย์',
        durationMinutes: 50
    },
    {
        routeCode: 'route_future',
        routeName: 'ธรรมศาสตร์ รังสิต -> ฟิวเจอร์พาร์ค',
        origin: 'ธรรมศาสตร์ รังสิต',
        destination: 'ฟิวเจอร์พาร์ค',
        durationMinutes: 30
    }
];

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
                        durationMinutes: def.durationMinutes
                    },
                    $setOnInsert: {
                        origin: def.origin,
                        destination: def.destination
                    }
                },
                { upsert: true, new: true }
            );
        }

        // Backfill human-readable name for any remaining routes (e.g., reverse routes)
        await Route.updateMany(
            { routeName: { $in: [null, ''] } },
            [{ $set: { routeName: { $concat: ['$origin', ' -> ', '$destination'] } } }]
        );

        console.log('Fixed routes ensured.');
    } catch (error) {
        console.error('Init Error (Routes):', error);
    }
};

const initDailyTrips = async () => {
    try {
        const todayStart = startOfDay(new Date());
        const existingTrips = await Trip.countDocuments({
            departureTime: { $gte: todayStart }
        });

        if (existingTrips > 0) return;

        console.log('Generating daily trips...');

        const mochitRoute = await Route.findOne({ routeCode: 'route_mochit' });
        const victoryRoute = await Route.findOne({ routeCode: 'route_victory' });
        const futureRoute = await Route.findOne({ routeCode: 'route_future' });

        const tripsToInsert = [];

        const generateSlots = (route, startH, startM, endH, endM, interval) => {
            if (!route) return;

            let current = setMinutes(setHours(todayStart, startH), startM);
            const end = setMinutes(setHours(todayStart, endH), endM);

            while (isBefore(current, end) || isEqual(current, end)) {
                tripsToInsert.push({
                    route: route._id,
                    departureTime: new Date(current),
                    seatCapacity: 13,
                    availableSeats: 13,
                    status: 'scheduled',
                    vanRef: null,
                    driverId: null
                });
                current = addMinutes(current, interval);
            }
        };

        // Mochit: 05:30 - 20:30 every 30 min
        generateSlots(mochitRoute, 5, 30, 20, 30, 30);
        // Victory: 05:30 - 20:30 every 30 min
        generateSlots(victoryRoute, 5, 30, 20, 30, 30);
        // Future Park: 07:00 - 20:00 every 30 min
        generateSlots(futureRoute, 7, 0, 20, 0, 30);

        if (tripsToInsert.length > 0) {
            await Trip.insertMany(tripsToInsert);
            console.log(`Generated ${tripsToInsert.length} trips for today.`);
        }
    } catch (error) {
        console.error('Init Error (Trips):', error);
    }
};

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

const initSystem = async () => {
    console.log('Starting system initialization...');
    await initRoutes();
    await initDailyTrips();
    await resetDailyBindings();
    console.log('System initialization complete.');
};

module.exports = { initSystem };
