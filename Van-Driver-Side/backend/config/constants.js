/**
 * Application Constants
 */

module.exports = {
    DEFAULT_VAN_SEATS: 13,
    MAX_VAN_CAPACITY: 15,

    BOOKING_STATUS: {
        PENDING: 'pending',
        CHECKED_IN: 'checked_in',
        CANCELLED: 'cancelled'
    },

    TRIP_STATUS: {
        SCHEDULED: 'scheduled',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },

    PAYMENT_STATUS: {
        PENDING: 'pending',
        PAID: 'paid',
        REFUNDED: 'refunded'
    },

    QUEUE_TYPE: {
        ONLINE: 'online',
        WALK_IN: 'walk-in'
    },

    USER_ROLES: {
        DRIVER: 'driver',
        PASSENGER: 'passenger',
        ADMIN: 'admin'
    },

    GPS: {
        ARRIVAL_THRESHOLD_KM: 0.5,
        UPDATE_INTERVAL_MS: 5000
    }
};
