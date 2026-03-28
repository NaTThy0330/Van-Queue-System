/**
 * Trip List Page — Selection Only
 * Browse and select pre-configured trips by route tab.
 * Includes confirmation modal before committing.
 */
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getAvailableTrips, assignTrip } from '../services/api';
import { getDriver } from '../services/auth';
import './TripList.css';

export default function TripList({ driver, van, onSelectTrip, onBack }) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('mochit');
    const [confirmTrip, setConfirmTrip] = useState(null);
    const [selecting, setSelecting] = useState(false);
    const [assignError, setAssignError] = useState('');

    const filteredTrips = trips.filter(trip => {
        const routeName = trip.route_id?.route_name || '';
        if (activeTab === 'mochit') return routeName.includes('หมอชิต');
        if (activeTab === 'victory') return routeName.includes('อนุสาวรีย์');
        if (activeTab === 'future') return routeName.includes('ฟิวเจอร์');
        return true;
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const tripsRes = await getAvailableTrips();
            if (tripsRes.success) setTrips(tripsRes.trips || []);
        } catch (err) {
            console.error('Load data error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSelect = async () => {
        if (!confirmTrip || selecting) return;
        setSelecting(true);
        setAssignError('');
        try {
            const driverId = driver?.id || getDriver()?.id;
            const vanId = van?.van_id || van?._id;
            const data = await assignTrip(confirmTrip._id, driverId, vanId);
            if (data.success) {
                onSelectTrip(data.trip);
            } else {
                setAssignError(data.error || 'เลือกรอบไม่สำเร็จ');
                setSelecting(false);
            }
        } catch (err) {
            console.error('Assign trip error:', err);
            const msg = err.response?.data?.error || 'เลือกรอบไม่สำเร็จ';
            setAssignError(msg);
            // If trip was taken by another driver, refresh the list
            if (err.response?.data?.code === 'TRIP_NOT_AVAILABLE') {
                loadData();
                setConfirmTrip(null);
            }
            setSelecting(false);
        }
    };

    if (loading) {
        return (
            <div className="triplist-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="triplist-container">
            {/* Header */}
            <div className="triplist-header">
                <button className="back-btn" onClick={onBack}>
                    <ChevronLeft size={24} />
                </button>
                <h1>เลือกรอบรถ</h1>
            </div>

            {/* Van Info */}
            {van && (
                <div className="van-info-bar">
                    🚐 {van.plate_number} • {van.seat_capacity || 13} ที่นั่ง
                </div>
            )}

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-btn ${activeTab === 'mochit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mochit')}
                >
                    หมอชิต
                </button>
                <button
                    className={`tab-btn ${activeTab === 'victory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('victory')}
                >
                    อนุสาวรีย์
                </button>
                <button
                    className={`tab-btn ${activeTab === 'future' ? 'active' : ''}`}
                    onClick={() => setActiveTab('future')}
                >
                    ฟิวเจอร์
                </button>
            </div>

            {/* Available Trips */}
            <div className="trips-section">
                <h3>📋 รอบรถที่เปิดรับ ({filteredTrips.length})</h3>

                {filteredTrips.length > 0 ? (
                    <div className="trip-list">
                        {filteredTrips.map((trip) => (
                            <div
                                key={trip._id}
                                className="trip-card"
                                onClick={() => setConfirmTrip(trip)}
                            >
                                <div className="trip-time">
                                    {new Date(trip.departure_time).toLocaleTimeString('th-TH', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                                <div className="trip-details">
                                    <h4>{trip.route_id?.route_name || 'ไม่ระบุเส้นทาง'}</h4>
                                    <p>ที่นั่งว่าง {trip.available_seats}/{trip.total_seats || 13}</p>
                                </div>
                                <div className="trip-arrow">→</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>ไม่มีรอบรถในสายนี้</p>
                        <p>กรุณาเลือกสายอื่น</p>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmTrip && (
                <div className="trip-confirm-overlay" onClick={() => !selecting && setConfirmTrip(null)}>
                    <div className="trip-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="trip-confirm-icon">🚐</div>
                        <h3>ยืนยันเลือกรอบนี้?</h3>
                        <div className="trip-confirm-info">
                            <p className="confirm-route">{confirmTrip.route_id?.route_name || 'ไม่ระบุ'}</p>
                            <p className="confirm-time">
                                เวลาออก {new Date(confirmTrip.departure_time).toLocaleTimeString('th-TH', {
                                    hour: '2-digit', minute: '2-digit'
                                })} น.
                            </p>
                            <p className="confirm-seats">
                                ว่าง {confirmTrip.available_seats}/{confirmTrip.total_seats || 13} ที่นั่ง
                            </p>
                            {assignError && (
                                <p className="confirm-error">⚠️ {assignError}</p>
                            )}
                        </div>
                        <div className="trip-confirm-actions">
                            <button className="btn-confirm-no" onClick={() => { setConfirmTrip(null); setAssignError(''); }} disabled={selecting}>
                                ยกเลิก
                            </button>
                            <button className="btn-confirm-yes" onClick={handleConfirmSelect} disabled={selecting}>
                                {selecting ? 'กำลังเลือก...' : 'ยืนยัน'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
