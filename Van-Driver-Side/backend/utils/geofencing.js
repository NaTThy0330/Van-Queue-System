/**
 * Geofencing Utilities
 * Haversine formula for GPS distance calculation
 */

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

function checkGeofence(currentLocation, destination, radiusMeters = 200) {
    if (!currentLocation || !currentLocation.latitude || !currentLocation.longitude) {
        return {
            isWithinRange: false,
            distance: null,
            message: 'ไม่สามารถระบุตำแหน่งปัจจุบันได้ กรุณาเปิด GPS',
            code: 'GPS_NOT_AVAILABLE'
        };
    }

    if (!destination || !destination.lat || !destination.lng) {
        return {
            isWithinRange: false,
            distance: null,
            message: 'ไม่พบข้อมูลพิกัดจุดหมายปลายทาง',
            code: 'DESTINATION_NOT_FOUND'
        };
    }

    const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        destination.lat,
        destination.lng
    );

    const isWithinRange = distance <= radiusMeters;

    return {
        isWithinRange,
        distance: Math.round(distance),
        message: isWithinRange
            ? `อยู่ในเขตจุดหมายปลายทาง (${Math.round(distance)} เมตร)`
            : `ยังไม่อยู่ในเขตจุดหมาย (ห่าง ${Math.round(distance)} เมตร, ต้องอยู่ภายใน ${radiusMeters} เมตร)`,
        code: isWithinRange ? 'WITHIN_RANGE' : 'OUT_OF_RANGE'
    };
}

const GEOFENCE_RADIUS = 200;

module.exports = {
    calculateDistance,
    checkGeofence,
    GEOFENCE_RADIUS
};
