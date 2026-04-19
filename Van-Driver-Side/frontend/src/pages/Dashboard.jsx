/**
 * Dashboard Page — Smart Driver Assistant (Tab-based UI)
 * - 3 Tabs: ภาพรวม / ผู้โดยสาร / จัดการ
 * - Real-time Countdown Timer to departure
 * - Context-Aware Step Guide (T-15, T-5, T-0)
 * - Stats cards (waiting, sold, pending payments)
 * - Badges on action buttons
 * - Walk-in with Virtual Ticket Modal
 * - Live seat counter via Socket.IO
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { getCurrentTrip, quickWalkin, sendDepartureNotification, cancelPassenger, clearNoShow, abandonTrip, getDashboardStats } from '../services/api';
import { getDriver } from '../services/auth';
import { initSocket, joinTrip, onSeatUpdate, onBookingAdded } from '../services/socket';
import WalkInTicketModal from '../components/WalkInTicketModal';
import Toast from '../components/Toast';
import './Dashboard.css';

// ========== COUNTDOWN HELPER ==========
function getCountdown(departureTime) {
    if (!departureTime) return { total: 0, hours: 0, minutes: 0, seconds: 0, label: '--:--:--' };
    const diff = new Date(departureTime).getTime() - Date.now();
    if (diff <= 0) {
        const overMs = Math.abs(diff);
        const overMin = Math.floor(overMs / 60000);
        return { total: diff, hours: 0, minutes: 0, seconds: 0, label: `เลยเวลา ${overMin} นาที`, overdue: true };
    }
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return {
        total: diff,
        hours, minutes, seconds,
        label: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
        overdue: false
    };
}

// ========== STEP GUIDE LOGIC ==========
function getStepGuide(countdown, isDeparted) {
    if (isDeparted) {
        return { phase: 'departed', icon: '🛣️', message: 'กำลังเดินทาง', color: 'green' };
    }
    const totalMinutes = countdown.total / 60000;
    if (countdown.overdue) {
        return { phase: 'overdue', icon: '🚩', message: 'ได้เวลาออกเดินทาง!', color: 'red', pulse: true };
    }
    if (totalMinutes <= 5) {
        return { phase: 'boarding', icon: '🚐', message: 'เริ่มเรียกผู้โดยสารขึ้นรถ', color: 'orange', highlightUnchecked: true };
    }
    if (totalMinutes <= 15) {
        return { phase: 'notify', icon: '🔔', message: 'ควรส่งแจ้งเตือนผู้โดยสาร', color: 'blue', showNotifyHint: true };
    }
    return { phase: 'waiting', icon: '⏳', message: 'กำลังรอผู้โดยสาร', color: 'gray' };
}

const TABS = [
    { key: 'overview', label: '📊 ภาพรวม' },
    { key: 'passengers', label: '👥 ผู้โดยสาร' },
    { key: 'actions', label: '⚙️ จัดการ' }
];

export default function Dashboard({
    driver,
    trip: initialTrip,
    van,
    roundsToday,
    onCheckIn,
    onPayments,
    onDepart,
    onEndTrip,
    onBack,
    onTripUpdate
}) {
    const [trip, setTrip] = useState(initialTrip);
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(!initialTrip);
    const [walkInLoading, setWalkInLoading] = useState(false);
    const [notifying, setNotifying] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Stats
    const [stats, setStats] = useState({ waitingCheckIn: 0, checkedIn: 0, totalTicketsSold: 0, pendingPayments: 0 });

    // Countdown timer state
    const [countdown, setCountdown] = useState(() => getCountdown(initialTrip?.departure_time));

    // Ticket modal state
    const [ticketData, setTicketData] = useState(null);

    // Cancel confirmation modal state
    const [cancelTarget, setCancelTarget] = useState(null);

    // No-show clearance modal state
    const [noShowModal, setNoShowModal] = useState(false);
    const [noShowLoading, setNoShowLoading] = useState(false);

    // Abandon trip modal state
    const [abandonModal, setAbandonModal] = useState(false);
    const [abandonLoading, setAbandonLoading] = useState(false);

    // ========== COUNTDOWN TICK ==========
    useEffect(() => {
        if (!trip?.departure_time || trip.status === 'departed') return;

        const timer = setInterval(() => {
            setCountdown(getCountdown(trip.departure_time));
        }, 1000);

        return () => clearInterval(timer);
    }, [trip?.departure_time, trip?.status]);

    // ========== SOCKET + DATA LOAD ==========
    useEffect(() => {
        loadTrip();

        const socket = initSocket();
        if (initialTrip?._id) {
            joinTrip(initialTrip._id);
        }

        const unsubSeat = onSeatUpdate((data) => {
            if (data.trip_id === trip?._id || data.trip_id === initialTrip?._id) {
                setTrip(prev => {
                    const updated = { ...prev, available_seats: data.available_seats };
                    if (onTripUpdate) onTripUpdate(updated);
                    return updated;
                });
            }
        });

        const unsubBooking = onBookingAdded((data) => {
            if (data.trip_id === trip?._id || data.trip_id === initialTrip?._id) {
                setPassengers(prev => [...prev, data]);
            }
        });

        return () => {
            unsubSeat();
            unsubBooking();
        };
    }, []);

    // ========== AUTO-POLLING (backup for cross-system sync) ==========
    useEffect(() => {
        if (!trip?._id || trip?.status === 'departed' || trip?.status === 'completed') return;
        const interval = setInterval(() => {
            loadTrip();
        }, 15000);
        return () => clearInterval(interval);
    }, [trip?._id, trip?.status]);

    const loadTrip = async () => {
        try {
            const driverId = driver?.id || getDriver()?.id;
            const data = await getCurrentTrip(driverId);
            if (data.success && data.trip) {
                setTrip(data.trip);
                setPassengers(data.passengers || []);
                joinTrip(data.trip._id);
                setCountdown(getCountdown(data.trip.departure_time));
                if (onTripUpdate) onTripUpdate(data.trip);
                // Load stats
                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (err) {
            console.error('Load trip error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async (tripId) => {
        try {
            const data = await getDashboardStats(tripId);
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Load stats error:', err);
        }
    };

    // Reload stats when trip changes
    useEffect(() => {
        if (trip?._id) {
            loadStats(trip._id);
        }
    }, [trip?._id, passengers.length]);

    // ========== WALK-IN + TICKET ==========
    const handleWalkIn = async () => {
        if (!trip?._id || trip.available_seats <= 0) return;

        setWalkInLoading(true);
        try {
            const data = await quickWalkin(trip._id);
            if (data.success) {
                setTrip(prev => {
                    const updated = { ...prev, available_seats: data.available_seats };
                    if (onTripUpdate) onTripUpdate(updated);
                    return updated;
                });
                // Show Virtual Ticket Modal
                setTicketData(data.queue);
                // Reload passengers in background
                loadTrip();
            }
        } catch (err) {
            console.error('Walk-in error:', err);
            setToast({ message: err.response?.data?.error || 'เพิ่ม Walk-in ไม่สำเร็จ', type: 'error' });
        } finally {
            setWalkInLoading(false);
        }
    };

    // ========== CANCEL WALK-IN ==========
    const handleCancelWalkin = async (queueId) => {
        try {
            const data = await cancelPassenger(queueId, 'ยกเลิกโดยคนขับ');
            if (data.success) {
                if (data.available_seats != null) {
                    setTrip(prev => {
                        const updated = { ...prev, available_seats: data.available_seats };
                        if (onTripUpdate) onTripUpdate(updated);
                        return updated;
                    });
                }
                setPassengers(prev => prev.filter(p => p._id !== queueId));
                setToast({ message: 'ยกเลิกตั๋ว Walk-in และคืนที่นั่งสำเร็จ', type: 'success' });
            }
        } catch (err) {
            console.error('Cancel walk-in error:', err);
            setToast({ message: err.response?.data?.error || 'ยกเลิกไม่สำเร็จ', type: 'error' });
        } finally {
            setCancelTarget(null);
        }
    };

    const handleTicketUndo = async (queueId) => {
        setTicketData(null);
        await handleCancelWalkin(queueId);
    };

    // ========== NO-SHOW CLEARANCE ==========
    const handleClearNoShow = async () => {
        if (!trip?._id) return;
        setNoShowLoading(true);
        try {
            const data = await clearNoShow(trip._id);
            if (data.success) {
                setTrip(prev => {
                    const updated = { ...prev, available_seats: data.available_seats };
                    if (onTripUpdate) onTripUpdate(updated);
                    return updated;
                });
                setPassengers(prev => prev.filter(p => p.status === 'checked_in'));
                setToast({
                    message: `เคลียร์ผู้โดยสารไม่มา ${data.cleared_count} คน คืน ${data.seats_released} ที่นั่ง`,
                    type: 'success'
                });
            }
        } catch (err) {
            console.error('No-show clearance error:', err);
            setToast({ message: err.response?.data?.error || 'เคลียร์ที่นั่งไม่สำเร็จ', type: 'error' });
        } finally {
            setNoShowLoading(false);
            setNoShowModal(false);
        }
    };

    const handleNotify = async () => {
        if (!trip?._id) return;

        setNotifying(true);
        try {
            await sendDepartureNotification(trip._id);
            setToast({ message: '📢 ส่งแจ้งเตือนผู้โดยสารแล้ว!', type: 'success' });
        } catch (err) {
            console.error('Notify error:', err);
            setToast({ message: 'ส่งแจ้งเตือนไม่สำเร็จ', type: 'error' });
        } finally {
            setNotifying(false);
        }
    };

    // ========== ABANDON TRIP ==========
    const handleAbandonTrip = async () => {
        if (!trip?._id) return;
        setAbandonLoading(true);
        try {
            const data = await abandonTrip(trip._id);
            if (data.success) {
                setToast({ message: 'ยกเลิกรอบรถสำเร็จ', type: 'success' });
                setTimeout(() => onBack(), 500);
            }
        } catch (err) {
            console.error('Abandon error:', err);
            setToast({ message: err.response?.data?.error || 'ยกเลิกรอบไม่สำเร็จ', type: 'error' });
        } finally {
            setAbandonLoading(false);
            setAbandonModal(false);
        }
    };

    // ========== COMPUTED ==========
    const stepGuide = useMemo(
        () => getStepGuide(countdown, trip?.status === 'departed'),
        [countdown, trip?.status]
    );

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="dashboard-container">
                <div className="empty-state">
                    <p>ไม่มีรอบรถที่กำลังดำเนินการ</p>
                    <button onClick={onBack}>← ไปเลือกรอบ</button>
                </div>
            </div>
        );
    }

    const totalSeats = trip.total_seats || 13;
    const usedSeats = passengers.filter(p => p.status !== 'cancelled' && p.status !== 'expired' && p.status !== 'no_show').length;
    const progress = (usedSeats / totalSeats) * 100;
    const isFull = usedSeats >= totalSeats;
    const isDeparted = trip.status === 'departed';

    // Grouped passengers
    const checkedInPassengers = passengers.filter(p => p.status === 'checked_in');
    const pendingPassengers = passengers.filter(p => p.status === 'pending' || p.status === 'confirmed');
    const showNoShowBtn = !isDeparted && pendingPassengers.length > 0 && (stepGuide.phase === 'boarding' || stepGuide.phase === 'overdue');
    const canAbandon = !isDeparted && passengers.length === 0;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <button className="back-btn" onClick={onBack}>
                    <ChevronLeft size={24} />
                </button>
                <div className="route-info">
                    <h1>{trip.route_id?.route_name || 'ไม่ระบุเส้นทาง'}</h1>
                    <p>
                        {new Date(trip.departure_time).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })} น.
                    </p>
                </div>
                <span className={`status-pill ${trip.status}`}>
                    {trip.status === 'scheduled' ? 'รอออกรถ' : 'ออกเดินทางแล้ว'}
                </span>
            </div>

            {/* Shift Info Bar */}
            {van && (
                <div className="shift-bar">
                    <span className="shift-bar-van">🚐 {van.plate_number}</span>
                    <span className="shift-bar-round">รอบที่ {(roundsToday || 0) + 1} ของวันนี้</span>
                </div>
            )}

            {/* ===== TAB NAVIGATION ===== */}
            <div className="tab-nav">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                        {tab.key === 'passengers' && stats.waitingCheckIn > 0 && (
                            <span className="tab-badge">{stats.waitingCheckIn}</span>
                        )}
                        {tab.key === 'actions' && stats.pendingPayments > 0 && (
                            <span className="tab-badge warning">{stats.pendingPayments}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ===== TAB: ภาพรวม ===== */}
            {activeTab === 'overview' && (
                <div className="tab-content">
                    {/* Countdown Timer */}
                    {!isDeparted && (
                        <div className={`countdown-section phase-${stepGuide.phase}`}>
                            <div className="countdown-display">
                                <span className="countdown-label">เวลาถึงออกรถ</span>
                                <span className={`countdown-timer ${countdown.overdue ? 'overdue' : ''}`}>
                                    {countdown.label}
                                </span>
                            </div>
                            <div className={`step-guide step-${stepGuide.color}`}>
                                <span className="step-icon">{stepGuide.icon}</span>
                                <span className="step-message">{stepGuide.message}</span>
                            </div>
                        </div>
                    )}

                    {/* Seat Counter */}
                    <div className="seat-section">
                        <div className="seat-counter">
                            <div className="seat-number">
                                <span className="used">{usedSeats}</span>
                                <span className="sep">/</span>
                                <span className="total">{trip.total_seats || 13}</span>
                            </div>
                            <span className="seat-label">ที่นั่ง</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className={`progress-fill ${isFull ? 'full' : ''}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="seats-remaining">
                            {isFull ? '🚫 เต็มแล้ว!' : `ว่างอีก ${totalSeats - usedSeats} ที่นั่ง`}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-card-value">{stats.totalTicketsSold}</span>
                            <span className="stat-card-label">🎫 ตั๋วทั้งหมด</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-card-value">{stats.checkedIn}</span>
                            <span className="stat-card-label">✅ เช็กอินแล้ว</span>
                        </div>
                        <div className="stat-card warning">
                            <span className="stat-card-value">{stats.waitingCheckIn}</span>
                            <span className="stat-card-label">⏳ รอเช็กอิน</span>
                        </div>
                        <div className="stat-card accent">
                            <span className="stat-card-value">{stats.pendingPayments}</span>
                            <span className="stat-card-label">💳 รอตรวจสลิป</span>
                        </div>
                    </div>

                    {/* Quick Walk-in Button */}
                    {!isDeparted && (
                        <button
                            className={`btn-walkin ${isFull ? 'disabled' : ''}`}
                            onClick={handleWalkIn}
                            disabled={walkInLoading || isFull}
                        >
                            {walkInLoading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <>
                                    <span className="walkin-icon">➕</span>
                                    <span>เพิ่ม Walk-in</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* ===== TAB: ผู้โดยสาร ===== */}
            {activeTab === 'passengers' && (
                <div className="tab-content">
                    <div className="passengers-section">
                        <h3>👥 รายชื่อผู้โดยสาร ({passengers.length} คน)</h3>
                        {passengers.length === 0 ? (
                            <p className="no-passengers">ยังไม่มีผู้โดยสารจองเข้ามา</p>
                        ) : (
                            <>
                                {/* Checked-in group */}
                                {checkedInPassengers.length > 0 && (
                                    <div className="passenger-group">
                                        <div className="group-label checked">✅ เช็กอินแล้ว ({checkedInPassengers.length})</div>
                                        <div className="passenger-list">
                                            {checkedInPassengers.map((p, idx) => {
                                                const isWalkin = (p.type || p.queue_type || p.queueType) === 'walkin';
                                                const ticketId = p.ticket_code || p.ticketCode || p._id?.slice(-4)?.toUpperCase() || '----';
                                                return (
                                                    <div key={p._id} className="passenger-item checked_in">
                                                        <span className="passenger-num">#{idx + 1}</span>
                                                        <div className="passenger-detail">
                                                            <span className="passenger-name">
                                                                {isWalkin ? `Walk-in` : (p.passenger_name || p.passengerName || 'ผู้โดยสาร')}
                                                            </span>
                                                            <span className="ticket-badge">🎫 {ticketId}</span>
                                                        </div>
                                                        <span className={`passenger-type ${isWalkin ? 'walkin' : 'online'}`}>
                                                            {isWalkin ? 'Walk-in' : 'ออนไลน์'}
                                                        </span>
                                                        {isWalkin && !isDeparted && (
                                                            <button className="btn-cancel-walkin" onClick={() => setCancelTarget(p)} title="ยกเลิกตั๋ว">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Pending / Not checked-in group */}
                                {pendingPassengers.length > 0 && (
                                    <div className="passenger-group">
                                        <div className="group-label pending">⏳ ยังไม่มาเช็กอิน ({pendingPassengers.length})</div>
                                        <div className="passenger-list">
                                            {pendingPassengers.map((p, idx) => {
                                                const isWalkin = (p.type || p.queue_type || p.queueType) === 'walkin';
                                                const ticketId = p.ticket_code || p.ticketCode || p._id?.slice(-4)?.toUpperCase() || '----';
                                                return (
                                                    <div key={p._id} className={`passenger-item pending-highlight ${stepGuide.highlightUnchecked ? 'unchecked-highlight' : ''}`}>
                                                        <span className="passenger-num">#{idx + 1}</span>
                                                        <div className="passenger-detail">
                                                            <span className="passenger-name">
                                                                {isWalkin ? `Walk-in` : (p.passenger_name || p.passengerName || 'ผู้โดยสาร')}
                                                            </span>
                                                            <span className="ticket-badge">🎫 {ticketId}</span>
                                                        </div>
                                                        <span className={`passenger-type ${isWalkin ? 'walkin' : 'online'}`}>
                                                            {isWalkin ? 'Walk-in' : 'ออนไลน์'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Quick Walk-in in passengers tab too */}
                    {!isDeparted && (
                        <button
                            className={`btn-walkin ${isFull ? 'disabled' : ''}`}
                            onClick={handleWalkIn}
                            disabled={walkInLoading || isFull}
                        >
                            {walkInLoading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <>
                                    <span className="walkin-icon">➕</span>
                                    <span>เพิ่ม Walk-in</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* ===== TAB: จัดการ ===== */}
            {activeTab === 'actions' && (
                <div className="tab-content">
                    {/* Action Buttons */}
                    <div className="action-grid">
                        <button
                            className={`action-btn notify ${stepGuide.showNotifyHint ? 'highlighted' : ''}`}
                            onClick={handleNotify}
                            disabled={notifying}
                        >
                            {stepGuide.showNotifyHint && <span className="hint-dot"></span>}
                            📢 แจ้งเตือนผู้โดยสาร
                        </button>
                        <button
                            className={`action-btn checkin ${stepGuide.highlightUnchecked ? 'highlighted' : ''}`}
                            onClick={onCheckIn}
                        >
                            {stepGuide.highlightUnchecked && <span className="hint-dot"></span>}
                            ✓ เช็กอิน
                            {stats.waitingCheckIn > 0 && (
                                <span className="action-badge">{stats.waitingCheckIn}</span>
                            )}
                        </button>
                        <button className="action-btn payments" onClick={onPayments}>
                            💳 ตรวจสลิป
                            {stats.pendingPayments > 0 && (
                                <span className="action-badge warning">{stats.pendingPayments}</span>
                            )}
                        </button>
                        {!isDeparted ? (
                            <button
                                className={`action-btn depart ${stepGuide.pulse ? 'pulse-depart' : ''}`}
                                onClick={onDepart}
                            >
                                🚀 ออกเดินทาง
                            </button>
                        ) : (
                            <button className="action-btn complete" onClick={onEndTrip}>
                                🏁 สิ้นสุดเที่ยว
                            </button>
                        )}
                    </div>

                    {/* No-show Clearance Button */}
                    {showNoShowBtn && (
                        <button
                            className="btn-noshow-clear"
                            onClick={() => setNoShowModal(true)}
                        >
                            <span>🚫 เคลียร์ที่นั่งคนไม่มา</span>
                            <span className="noshow-badge">{pendingPassengers.length} คน</span>
                        </button>
                    )}

                    {/* Abandon Trip Button — only when empty */}
                    {canAbandon && (
                        <button className="btn-abandon-trip" onClick={() => setAbandonModal(true)}>
                            ↩️ เลือกรอบผิด? ยกเลิกรอบนี้
                        </button>
                    )}
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {cancelTarget && (
                <div className="cancel-modal-overlay" onClick={() => setCancelTarget(null)}>
                    <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cancel-modal-icon">🗑️</div>
                        <h3>ยืนยันยกเลิกตั๋ว</h3>
                        <p>
                            ต้องการยกเลิกตั๋ว Walk-in รหัส
                            <strong> #{cancelTarget.ticket_code || cancelTarget.ticketCode || cancelTarget._id?.slice(-4)?.toUpperCase()}</strong> ใช่หรือไม่?
                        </p>
                        <p className="cancel-modal-note">ระบบจะคืนที่นั่งว่าง 1 ที่</p>
                        <div className="cancel-modal-actions">
                            <button className="btn-cancel-no" onClick={() => setCancelTarget(null)}>
                                ไม่ใช่
                            </button>
                            <button className="btn-cancel-yes" onClick={() => handleCancelWalkin(cancelTarget._id)}>
                                ยืนยันยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* No-show Confirmation Modal */}
            {noShowModal && (
                <div className="cancel-modal-overlay" onClick={() => setNoShowModal(false)}>
                    <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cancel-modal-icon">🚫</div>
                        <h3>เคลียร์ที่นั่งคนไม่มา</h3>
                        <p>
                            มีผู้โดยสารยังไม่มาเช็กอิน <strong>{pendingPassengers.length} คน</strong>
                        </p>
                        <p className="cancel-modal-note">
                            ยืนยันตัดสิทธิ์เพื่อปล่อยที่นั่งให้ Walk-in หรือไม่?
                        </p>
                        <div className="cancel-modal-actions">
                            <button className="btn-cancel-no" onClick={() => setNoShowModal(false)}>
                                ยังไม่
                            </button>
                            <button
                                className="btn-cancel-yes"
                                onClick={handleClearNoShow}
                                disabled={noShowLoading}
                            >
                                {noShowLoading ? 'กำลังเคลียร์...' : `ตัดสิทธิ์ ${pendingPassengers.length} คน`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Abandon Trip Confirmation Modal */}
            {abandonModal && (
                <div className="cancel-modal-overlay" onClick={() => setAbandonModal(false)}>
                    <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cancel-modal-icon">↩️</div>
                        <h3>ยกเลิกรอบนี้?</h3>
                        <p>ยืนยันยกเลิกรอบรถนี้เพื่อกลับไปเลือกรอบใหม่?</p>
                        <p className="cancel-modal-note">สามารถยกเลิกได้เฉพาะเมื่อยังไม่มีผู้โดยสาร</p>
                        <div className="cancel-modal-actions">
                            <button className="btn-cancel-no" onClick={() => setAbandonModal(false)} disabled={abandonLoading}>
                                ไม่ใช่
                            </button>
                            <button className="btn-cancel-yes" onClick={handleAbandonTrip} disabled={abandonLoading}>
                                {abandonLoading ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Walk-in Ticket Modal */}
            {ticketData && (
                <WalkInTicketModal
                    ticketData={ticketData}
                    trip={trip}
                    van={van}
                    onClose={() => setTicketData(null)}
                    onCancelTicket={handleTicketUndo}
                />
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
