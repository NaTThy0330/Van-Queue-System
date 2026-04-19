/**
 * CheckIn Page — Unified Check-in for Online + Walk-in
 * Shows ticket codes, passenger types, and tap-to-confirm
 */
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getPassengers, checkInPassenger, cancelPassenger } from '../services/api';
import './CheckIn.css';

export default function CheckIn({ trip, van, onBack }) {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        loadPassengers();
    }, [trip]);

    const loadPassengers = async () => {
        try {
            const data = await getPassengers(trip._id);
            if (data.success) {
                setPassengers(data.passengers || []);
            }
        } catch (err) {

        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (queueId) => {
        setActionLoading(prev => ({ ...prev, [queueId]: 'checkin' }));
        try {
            const data = await checkInPassenger(queueId);
            if (data.success) {
                setPassengers(prev =>
                    prev.map(p => p._id === queueId ? { ...p, status: 'checked_in' } : p)
                );
            }
        } catch (err) {

        } finally {
            setActionLoading(prev => ({ ...prev, [queueId]: null }));
        }
    };

    const handleCancel = async (queueId) => {
        if (!confirm('ยืนยันการยกเลิกผู้โดยสารนี้?')) return;

        setActionLoading(prev => ({ ...prev, [queueId]: 'cancel' }));
        try {
            const data = await cancelPassenger(queueId, 'ยกเลิกโดยคนขับ');
            if (data.success) {
                setPassengers(prev => prev.filter(p => p._id !== queueId));
            }
        } catch (err) {

        } finally {
            setActionLoading(prev => ({ ...prev, [queueId]: null }));
        }
    };

    if (loading) {
        return (
            <div className="checkin-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    const pending = passengers.filter(p => p.status === 'pending' || p.status === 'confirmed');
    const checkedIn = passengers.filter(p => p.status === 'checked_in');

    // Split pending by type
    const pendingOnline = pending.filter(p => (p.queueType || p.queue_type) !== 'walkin');
    const pendingWalkin = pending.filter(p => (p.queueType || p.queue_type) === 'walkin');

    const departureTime = trip?.departure_time
        ? new Date(trip.departure_time).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        })
        : '--:--';

    const getTicketCode = (p) => {
        return p.ticket_code || p.ticketCode || p._id?.slice(-4)?.toUpperCase() || '----';
    };

    const getPassengerDisplayName = (p) => {
        const isWalkin = (p.queueType || p.queue_type) === 'walkin';
        if (isWalkin) return p.passengerName || p.passenger_name || 'Walk-in';
        return p.passengerName || p.passenger_name || 'ผู้โดยสารออนไลน์';
    };

    return (
        <div className="checkin-container">
            {/* Header */}
            <div className="checkin-header">
                <button className="back-btn" onClick={onBack}>
                    <ChevronLeft size={24} />
                </button>
                <h1>เช็กอินผู้โดยสาร</h1>
            </div>

            {/* Trip/Van Info Bar */}
            <div className="trip-info-bar">
                <span className="trip-info-item">🕐 เที่ยว {departureTime}</span>
                <span className="trip-info-divider">|</span>
                <span className="trip-info-item">{trip?.route_id?.route_name || 'ไม่ระบุ'}</span>
                {van && (
                    <>
                        <span className="trip-info-divider">|</span>
                        <span className="trip-info-item">🚐 {van.plate_number}</span>
                    </>
                )}
            </div>

            {/* Summary */}
            <div className="summary-bar">
                <span className="summary-item pending">
                    รอเช็กอิน: <strong>{pending.length}</strong>
                </span>
                <span className="summary-item checked">
                    เช็กอินแล้ว: <strong>{checkedIn.length}</strong>
                </span>
                <span className="summary-item total">
                    ทั้งหมด: <strong>{passengers.length}</strong>
                </span>
            </div>

            {/* Pending Online Passengers */}
            {pendingOnline.length > 0 && (
                <div className="passenger-section">
                    <h3>🌐 ผู้โดยสารออนไลน์ — รอเช็กอิน ({pendingOnline.length})</h3>
                    {pendingOnline.map((p, idx) => (
                        <div key={p._id} className="passenger-card pending online">
                            <div className="passenger-info">
                                <span className="num">#{idx + 1}</span>
                                <div className="passenger-detail-col">
                                    <span className="name">{getPassengerDisplayName(p)}</span>
                                    <span className="ticket-code-badge">🎫 {getTicketCode(p)}</span>
                                </div>
                                <span className="type online">Online</span>
                            </div>
                            <div className="passenger-actions">
                                <button
                                    className="btn-checkin"
                                    onClick={() => handleCheckIn(p._id)}
                                    disabled={actionLoading[p._id]}
                                >
                                    {actionLoading[p._id] === 'checkin' ? '...' : '✓ มาแล้ว'}
                                </button>
                                <button
                                    className="btn-cancel"
                                    onClick={() => handleCancel(p._id)}
                                    disabled={actionLoading[p._id]}
                                >
                                    {actionLoading[p._id] === 'cancel' ? '...' : '✕'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pending Walk-in Passengers */}
            {pendingWalkin.length > 0 && (
                <div className="passenger-section">
                    <h3>🚶 Walk-in — รอเช็กอิน ({pendingWalkin.length})</h3>
                    {pendingWalkin.map((p, idx) => (
                        <div key={p._id} className="passenger-card pending walkin">
                            <div className="passenger-info">
                                <span className="num">#{idx + 1}</span>
                                <div className="passenger-detail-col">
                                    <span className="name">{getPassengerDisplayName(p)}</span>
                                    <span className="ticket-code-badge walkin">🎫 {getTicketCode(p)}</span>
                                </div>
                                <span className="type walkin">Walk-in</span>
                            </div>
                            <div className="passenger-actions">
                                <button
                                    className="btn-checkin"
                                    onClick={() => handleCheckIn(p._id)}
                                    disabled={actionLoading[p._id]}
                                >
                                    {actionLoading[p._id] === 'checkin' ? '...' : '✓'}
                                </button>
                                <button
                                    className="btn-cancel"
                                    onClick={() => handleCancel(p._id)}
                                    disabled={actionLoading[p._id]}
                                >
                                    {actionLoading[p._id] === 'cancel' ? '...' : '✕'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Checked In List */}
            {checkedIn.length > 0 && (
                <div className="passenger-section">
                    <h3>✅ เช็กอินแล้ว ({checkedIn.length})</h3>
                    {checkedIn.map((p, idx) => {
                        const isWalkin = (p.queueType || p.queue_type) === 'walkin';
                        return (
                            <div key={p._id} className="passenger-card checked">
                                <div className="passenger-info">
                                    <span className="num">#{idx + 1}</span>
                                    <div className="passenger-detail-col">
                                        <span className="name">{getPassengerDisplayName(p)}</span>
                                        <span className={`ticket-code-badge ${isWalkin ? 'walkin' : ''}`}>🎫 {getTicketCode(p)}</span>
                                    </div>
                                    <span className={`type ${isWalkin ? 'walkin' : 'online'}`}>
                                        {isWalkin ? 'Walk-in' : 'Online'}
                                    </span>
                                    <span className="status-badge">เช็กอินแล้ว</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {passengers.length === 0 && (
                <div className="empty-state">
                    <p>ยังไม่มีผู้โดยสาร</p>
                </div>
            )}
        </div>
    );
}
