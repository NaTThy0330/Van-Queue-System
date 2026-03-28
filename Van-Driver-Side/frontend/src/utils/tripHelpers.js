

export const getTripRoute = (trip) => {
    if (!trip) return { from: '', to: '' };

    // New schema (ERD-compliant)
    if (trip.route_id) {
        return {
            from: trip.route_id.origin || '',
            to: trip.route_id.destination || ''
        };
    }

    // Old schema (embedded route)
    if (trip.route) {
        return {
            from: trip.route.from || '',
            to: trip.route.to || ''
        };
    }

    return { from: '', to: '' };
};

export const getTripDepartureTime = (trip) => {
    if (!trip) return null;
    return trip.departure_time || trip.departureTime;
};

export const getTripArrivalTime = (trip) => {
    if (!trip) return null;
    return trip.arrival_time || trip.arrivalTime;
};

export const getTripCutoffTime = (trip) => {
    if (!trip) return null;
    return trip.cutoff_time || trip.cutoffTime;
};

export const getTripAvailableSeats = (trip) => {
    if (!trip) return 0;
    return trip.available_seats ?? trip.availableSeats ?? 0;
};

export const getTripTotalSeats = (trip) => {
    if (!trip) return 0;
    return trip.total_seats ?? trip.totalSeats ?? 13;
};
