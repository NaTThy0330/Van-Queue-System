import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getPassengers, confirmDeparture } from '../services/api';
import './Depart.css';

export default function Depart({ trip, onDeparted, onBack }) {
    const [passengers, setPassengers] = useState([]);
    const [noShows, setNoShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [departing, setDeparting] = useState(false);

    useEffect(() => {
        loadPassengers();
    }, [trip]);

    const loadPassengers = async () => {
        try {
            const data = await getPassengers(trip._id);
            if (data.success) {
                const all = data.passengers || [];
                setPassengers(all);
                // No-shows = pending status (not checked in)
                setNoShows(all.filter(p =>
                    p.status === 'pending' &&
                    (p.queue_type === 'online_paid' || p.type === 'online_paid')
                ));
            }
        } catch (err) {
            console.error('Load passengers error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDepart = async () => {
        if (noShows.length > 0) {
            if (!confirm(`มีผู้โดยสาร ${noShows.length} คนที่ยังไม่มา ต้องการออกเดินทางเลยหรือไม่?`)) {
                return;
            }
        }

        setDeparting(true);
        try {
            // Try to get current location
            let location = null;
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            timeout: 5000,
                            enableHighAccuracy: false
                        });
                    });
                    location = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };
                } catch (e) {
                    
                }
            }

            const data = await confirmDeparture(trip._id, location);
            if (data.success) {
                onDeparted();
            } else {
                alert(data.error || 'ไม่สามารถออกเดินทางได้');
            }
        } catch (err) {
            console.error('Depart error:', err);
            alert('เกิดข้อผิดพลาด');
        } finally {
            setDeparting(false);
        }
    };

    if (loading) {
        return (
            <div className="depart-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    const checkedIn = passengers.filter(p => p.status === 'checked_in');
    // const totalSeats = trip.total_seats || 13; // Removed as requested

    return (
        <div className="depart-container">
            {/* Header */}
            <div className="depart-header">
                <button className="back-btn" onClick={onBack}>
                    <ChevronLeft size={24} />
                </button>
                <h1>ตรวจสอบก่อนออกเดินทาง</h1>
            </div>

            {/* Departure Info Card */}
            <div className="departure-card">
                <div className="dep-route">
                    <span className="route-icon">🚐</span>
                    <span className="route-name">{trip.route_id?.route_name || 'ไม่ระบุเส้นทาง'}</span>
                </div>
                <div className="dep-time">
                    <span className="time-label">เวลาออก:</span>
                    <span className="time-value">
                        {new Date(trip.departure_time).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })} น.
                    </span>
                </div>
                <div className="dep-stat">
                    <div className="stat-item">
                        <span className="stat-val checked">{checkedIn.length}</span>
                        <span className="stat-lbl">เช็กอินแล้ว</span>
                    </div>
                </div>

                {/* Ticket Summary */}
                {checkedIn.length > 0 && (
                    <div className="ticket-summary">
                        <span className="ticket-summary-label">🎫 ตั๋วในรอบนี้:</span>
                        <div className="ticket-tags">
                            {checkedIn.map(p => {
                                const code = p.ticket_code || p.ticketCode || p._id?.slice(-4)?.toUpperCase() || '----';
                                return <span key={p._id} className="ticket-tag">{code}</span>;
                            })}
                        </div>
                    </div>
                )}

                {/* Zero check-in warning */}
                {checkedIn.length === 0 && passengers.length > 0 && (
                    <div className="zero-checkin-warning">
                        ⚠️ ยังไม่มีผู้โดยสารเช็กอิน — กรุณาเช็กอินก่อนออกเดินทาง
                    </div>
                )}
            </div>

            {/* Passenger Manifest */}
            <div className="manifest-section">
                <h3>📋 รายชื่อผู้โดยสาร ({checkedIn.length} คน)</h3>

                {checkedIn.length > 0 ? (
                    <div className="passenger-grid">
                        {checkedIn.map((p, idx) => {
                            const ticketCode = p.ticket_code || p.ticketCode || p._id?.slice(-4)?.toUpperCase() || '----';
                            return (
                            <div key={p._id} className="p-card confirmed">
                                <div className="p-icon">👤</div>
                                <div className="p-info">
                                    <div className="p-name">{p.passenger_name}</div>
                                    <div className="p-type">
                                        {(p.type || p.queue_type) === 'walkin' ? 'Walk-in' : 'Online'}
                                        <span className="p-ticket">🎫 {ticketCode}</span>
                                    </div>
                                </div>
                                <div className="p-status-icon">✅</div>
                            </div>);
                        })}
                    </div>
                ) : (
                    <div className="empty-manifest">
                        <p>ยังไม่มีผู้โดยสารเช็กอิน</p>
                        <p className="sub-text">โปรดเช็กอินผู้โดยสารก่อนออกเดินทาง</p>
                    </div>
                )}
            </div>

            {/* No-show Warning - Collapsible or distinct */}
            {noShows.length > 0 && (
                <div className="noshow-section">
                    <h3>⚠️ ยังไม่แสดงตัว ({noShows.length} คน)</h3>
                    <div className="noshow-list">
                        {noShows.map((p) => {
                            const ticketCode = p.ticket_code || p.ticketCode || p._id?.slice(-4)?.toUpperCase() || '----';
                            return (
                            <div key={p._id} className="p-card missing">
                                <div className="p-icon">❌</div>
                                <div className="p-info">
                                    <div className="p-name">{p.passenger_name}</div>
                                    <div className="p-type">Online Paid <span className="p-ticket">🎫 {ticketCode}</span></div>
                                </div>
                                <div className="p-status-text">No Show</div>
                            </div>);
                        })}
                    </div>
                </div>
            )}

            {/* Confirm Button */}
            <div className="depart-actions">
                <button
                    className={`btn-depart ${noShows.length > 0 ? 'warning' : ''}`}
                    onClick={handleDepart}
                    disabled={departing}
                >
                    {departing ? (
                        <span className="loading-spinner"></span>
                    ) : (
                        <>
                            <span className="btn-icon">🚀</span>
                            <span>{noShows.length > 0 ? 'ยืนยันออกเดินทาง (ตัด No-Show)' : 'ยืนยันออกเดินทาง'}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
