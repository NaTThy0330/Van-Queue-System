import { useState, useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { completeTrip } from '../services/api';
import './EndTrip.css';

// Haversine distance in meters
function distanceMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ARRIVE_RADIUS_M = 500; // within 500m of destination

export default function EndTrip({ trip, onComplete, onBack }) {
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    const [gettingLocation, setGettingLocation] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [nearDestination, setNearDestination] = useState(false);
    const [distanceToDest, setDistanceToDestination] = useState(null);

    const watchId = useRef(null);

    // Destination from route
    const destLat = trip?.route_id?.destination_lat;
    const destLng = trip?.route_id?.destination_lng;
    const destName = trip?.route_id?.destination || 'จุดหมาย';
    const hasDestCoords = destLat && destLng && destLat !== 0 && destLng !== 0;

    useEffect(() => {
        startGPSWatch();
        return () => stopGPSWatch();
    }, []);

    const startGPSWatch = () => {
        setGettingLocation(true);
        setLocationError('');

        if (!navigator.geolocation) {
            setLocationError('อุปกรณ์ไม่รองรับ GPS');
            setGettingLocation(false);
            return;
        }

        watchId.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                const coords = { lat: latitude, lng: longitude, accuracy };
                setLocation(coords);
                setGettingLocation(false);

                if (hasDestCoords) {
                    const dist = Math.round(distanceMeters(latitude, longitude, destLat, destLng));
                    setDistanceToDestination(dist);
                    setNearDestination(dist <= ARRIVE_RADIUS_M);

                } else {
                    // Fallback: no coords in DB → use accuracy check
                    setNearDestination(accuracy <= 200);
                    setDistanceToDestination(null);
                }
            },
            (err) => {
                console.error('GPS Error:', err);
                setLocationError('ไม่สามารถระบุตำแหน่งได้ (โปรดเปิด GPS)');
                setGettingLocation(false);
                setNearDestination(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const stopGPSWatch = () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
    };

    const handleComplete = async () => {
        setCompleting(true);
        try {
            const data = await completeTrip(trip._id, location);
            if (data.success) {
                onComplete(data);
            } else {
                alert(data.error || 'สิ้นสุดเที่ยวไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Complete trip error:', err);
            alert('เกิดข้อผิดพลาด');
        } finally {
            setCompleting(false);
        }
    };

    return (
        <div className="endtrip-container">
            {/* Header */}
            <div className="endtrip-header">
                <button className="back-btn" onClick={onBack}>
                    <ChevronLeft size={24} />
                </button>
                <h1>สิ้นสุดการเดินทาง</h1>
            </div>

            {/* Trip Info */}
            <div className="trip-card">
                <div className="route-name">{trip.route_id?.route_name || 'ไม่ระบุเส้นทาง'}</div>
                <div className="trip-meta">
                    <span className="status-pill running">กำลังเดินทาง</span>
                </div>
            </div>

            {/* GPS Status */}
            <div className={`gps-status ${nearDestination ? 'success' : locationError ? 'error' : 'loading'}`}>
                {gettingLocation ? (
                    <>
                        <div className="gps-spinner"></div>
                        <span>กำลังระบุตำแหน่ง...</span>
                    </>
                ) : location ? (
                    <>
                        <span className="gps-icon">📍</span>
                        <div className="gps-info">
                            <span className="gps-label">ระยะถึง {destName}</span>
                            <span className="gps-coords">
                                {distanceToDest != null
                                    ? nearDestination
                                        ? `✅ ถึงแล้ว! (${distanceToDest} ม.)`
                                        : `${distanceToDest} ม. (ต้องอยู่ภายใน ${ARRIVE_RADIUS_M} ม.)`
                                    : nearDestination ? 'GPS แม่นยำ (พร้อมจบงาน)' : 'กำลังตรวจสอบ...'
                                }
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <span className="gps-icon">⚠️</span>
                        <span>{locationError}</span>
                        <button className="btn-retry" onClick={startGPSWatch}>ลองอีกครั้ง</button>
                    </>
                )}
            </div>

            {/* Destination Check */}
            <div className={`destination-check ${nearDestination ? 'passed' : 'pending'}`}>
                {nearDestination ? (
                    <>
                        <span className="check-icon">✅</span>
                        <span>ถึงจุดหมายแล้ว — พร้อมจบงาน</span>
                    </>
                ) : (
                    <>
                        <span className="check-icon">⏳</span>
                        <span>
                            {distanceToDest != null
                                ? `เหลืออีก ${distanceToDest - ARRIVE_RADIUS_M > 0 ? distanceToDest - ARRIVE_RADIUS_M : '< 100'} เมตร`
                                : `รอสัญญาณ GPS...`}
                        </span>
                    </>
                )}
            </div>

            {/* Van Reset Note */}
            <div className="reset-note">
                <span className="note-icon">💡</span>
                <p>หลังสิ้นสุดเที่ยวนี้ ระบบจะพากลับไปหน้าหลัก เพื่อตรวจสอบข้อมูลรถก่อนเริ่มรอบถัดไป</p>
            </div>

            {/* Complete Button */}
            <div className="endtrip-actions">
                <button
                    className="btn-complete"
                    onClick={handleComplete}
                    disabled={completing || !nearDestination}
                >
                    {completing ? (
                        <span className="loading-spinner"></span>
                    ) : (
                        <>🏁 สิ้นสุดเที่ยวนี้</>
                    )}
                </button>

            </div>
        </div>
    );
}
