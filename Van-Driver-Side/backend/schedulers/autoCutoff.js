/**
 * Auto Cutoff Scheduler
 * - Cancels unpaid bookings after cutoff and marks no-shows
 * - Auto-generates daily trips at midnight (Bangkok time)
 */

const cron = require('node-cron');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const { initSystem } = require('../utils/initSystem');

const GRACE_PERIOD_MINUTES = 5;

async function autoCancelUnpaidBookings() {
    try {
        const now = new Date();

        const tripsToProcess = await Trip.find({
            status: 'scheduled',
            cutoffTime: { $lte: now }
        });

        let totalCancelled = 0;

        for (const trip of tripsToProcess) {
            const result = await Booking.updateMany(
                {
                    tripId: trip._id,
                    type: 'unpaid',
                    paymentStatus: 'pending',
                    status: 'active'
                },
                {
                    status: 'cancelled',
                    cancelledAt: now,
                    cancelReason: 'auto_cutoff'
                }
            );

            totalCancelled += result.modifiedCount;

            if (result.modifiedCount > 0) {
                const activeBookings = await Booking.countDocuments({
                    tripId: trip._id,
                    status: 'active'
                });

                await Trip.findByIdAndUpdate(trip._id, {
                    availableSeats: trip.seatCapacity - activeBookings
                });

                console.log(`Auto Cutoff: Trip ${trip._id} - cancelled ${result.modifiedCount} unpaid bookings`);
            }
        }

        if (totalCancelled > 0) {
            console.log(`Auto Cutoff: cancelled ${totalCancelled} bookings total`);
        }
    } catch (error) {
        console.error('Auto Cutoff Error:', error);
    }
}

async function autoTransferNoShowPaid() {
    try {
        const now = new Date();
        const graceThreshold = new Date(now.getTime() - (GRACE_PERIOD_MINUTES * 60 * 1000));

        const departedTrips = await Trip.find({
            status: 'departed',
            departureTime: { $lte: graceThreshold }
        });

        for (const trip of departedTrips) {
            const noShowPaid = await Booking.find({
                tripId: trip._id,
                type: 'paid',
                paymentStatus: 'verified',
                status: 'active',
                checkedIn: { $ne: true }
            });

            for (const booking of noShowPaid) {
                booking.status = 'no-show';
                booking.noShowAt = now;
                await booking.save();
                console.log(`No-Show: Booking ${booking._id} marked (grace period exceeded)`);
            }
        }
    } catch (error) {
        console.error('Auto Transfer No-Show Error:', error);
    }
}

function startAutoCutoffScheduler() {
    // Every minute: cutoff + no-show checks
    cron.schedule('* * * * *', async () => {
        await autoCancelUnpaidBookings();
        await autoTransferNoShowPaid();
    });

    // Every day at midnight Bangkok time (17:00 UTC) — generate next day's trips
    cron.schedule('0 17 * * *', async () => {
        console.log('[Scheduler] Midnight Bangkok — generating daily trips...');
        await initSystem();
    });

    console.log('Auto Cutoff Scheduler started (every minute)');
    console.log('Daily Trip Scheduler started (midnight Bangkok = 17:00 UTC)');
}

module.exports = {
    startAutoCutoffScheduler,
    autoCancelUnpaidBookings,
    autoTransferNoShowPaid
};
