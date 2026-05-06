/**
 * Payment Verification Page
 * Verify payment slips from passengers
 */
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getPendingPayments, verifyPayment } from '../services/api';
import { getApiUrl } from '../services/env';
import './PaymentVerification.css';

const resolveSlipUrl = (payment) => {
    const raw = payment?.slip_url || payment?.slipUrl || payment?.payment_slip || null;
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    const baseUrl = getApiUrl();
    return `${baseUrl}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

const resolveTicketCode = (payment) => {
    return (
        payment?.ticket_code ||
        payment?.ticketCode ||
        payment?.queue_id?.ticket_code ||
        payment?.queue_id?.ticketCode ||
        (payment?.seat_number ? `S-${String(payment.seat_number).padStart(2, '0')}` : null) ||
        null
    );
};

const resolvePassengerName = (payment) => {
    return (
        payment?.passenger_name ||
        payment?.passengerName ||
        payment?.queue_id?.passenger_name ||
        payment?.queue_id?.passengerName ||
        'ไม่ระบุชื่อ'
    );
};

export default function PaymentVerification({ trip, onBack }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [previewSlip, setPreviewSlip] = useState(null);

    useEffect(() => {
        if (!trip?._id) {
            setPayments([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        loadPayments(trip._id);
    }, [trip?._id]);

    const loadPayments = async (tripId) => {
        try {
            const data = await getPendingPayments(tripId);
            if (data.success) {
                setPayments(data.payments || []);
            }
        } catch (err) {
            console.error('Load payments error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (paymentId, action) => {
        setActionLoading((prev) => ({ ...prev, [paymentId]: action }));
        try {
            const data = await verifyPayment(paymentId, action);
            if (data.success) {
                setPayments((prev) => prev.filter((p) => p._id !== paymentId));
                setPreviewSlip(null);
            }
        } catch (err) {
            console.error('Verify error:', err);
            alert('ดำเนินการไม่สำเร็จ');
        } finally {
            setActionLoading((prev) => ({ ...prev, [paymentId]: null }));
        }
    };

    if (loading) {
        return (
            <div className="payment-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-container">
            <div className="payment-header">
                <button className="back-btn" onClick={onBack}>
                    <ChevronLeft size={24} />
                </button>
                <h1>ตรวจสอบการชำระเงิน</h1>
            </div>

            <div className="summary-bar">
                <span>
                    รอตรวจสอบ: <strong>{payments.length}</strong> รายการ
                </span>
            </div>

            {payments.length > 0 ? (
                <div className="payment-list">
                    {payments.map((payment) => {
                        const slipSrc = resolveSlipUrl(payment);
                        const ticketCode = resolveTicketCode(payment);
                        const passengerName = resolvePassengerName(payment);

                        return (
                            <div key={payment._id} className="payment-card">
                                <div className="payment-info">
                                    <div>
                                        <span className="ticket-number-label">ตั๋ว</span>
                                        <span className="ticket-number-value">
                                            {ticketCode || `#${String(payment._id).slice(-6).toUpperCase()}`}
                                        </span>
                                    </div>
                                    <span className="passenger-name">{passengerName}</span>
                                    <span className="amount">฿{payment.amount || 0}</span>
                                </div>

                                {slipSrc && (
                                    <div
                                        className="slip-preview"
                                        onClick={() => setPreviewSlip(payment)}
                                    >
                                        <img src={slipSrc} alt="Slip" />
                                        <span>แตะเพื่อดูเต็ม</span>
                                    </div>
                                )}

                                <div className="payment-actions">
                                    <button
                                        className="btn-approve"
                                        onClick={() => handleVerify(payment._id, 'approve')}
                                        disabled={actionLoading[payment._id]}
                                    >
                                        {actionLoading[payment._id] === 'approve' ? '...' : '✓ อนุมัติ'}
                                    </button>
                                    <button
                                        className="btn-reject"
                                        onClick={() => handleVerify(payment._id, 'reject')}
                                        disabled={actionLoading[payment._id]}
                                    >
                                        {actionLoading[payment._id] === 'reject' ? '...' : '✕ ปฏิเสธ'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <p>✅ ไม่มีสลิปที่รอตรวจสอบ</p>
                </div>
            )}

            {previewSlip && (
                <div className="slip-modal" onClick={() => setPreviewSlip(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="payment-info" style={{ marginBottom: '12px' }}>
                            <div>
                                <span className="ticket-number-label">ตั๋ว</span>
                                <span className="ticket-number-value">
                                    {resolveTicketCode(previewSlip) || `#${String(previewSlip._id).slice(-6).toUpperCase()}`}
                                </span>
                            </div>
                            <span className="passenger-name">{resolvePassengerName(previewSlip)}</span>
                        </div>
                        <img src={resolveSlipUrl(previewSlip)} alt="Slip Full" />
                        <div className="modal-actions">
                            <button
                                className="btn-approve"
                                onClick={() => handleVerify(previewSlip._id, 'approve')}
                                disabled={actionLoading[previewSlip._id]}
                            >
                                ✓ อนุมัติ
                            </button>
                            <button
                                className="btn-reject"
                                onClick={() => handleVerify(previewSlip._id, 'reject')}
                                disabled={actionLoading[previewSlip._id]}
                            >
                                ✕ ปฏิเสธ
                            </button>
                        </div>
                        <button className="back-btn" onClick={() => setPreviewSlip(null)}>
                            <ChevronLeft size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
