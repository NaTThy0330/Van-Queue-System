/**
 * PaymentVerification Page — Slip Attribution + Passenger Info
 * Shows ticket code, passenger name, and queue type for each payment slip
 */
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getPendingPayments, verifyPayment } from '../services/api';
import './PaymentVerification.css';

export default function PaymentVerification({ trip, onBack }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewSlip, setPreviewSlip] = useState(null);
    const [verifying, setVerifying] = useState({});

    useEffect(() => {
        loadPayments();
    }, [trip]);

    const loadPayments = async () => {
        try {
            const data = await getPendingPayments(trip._id);
            if (data.success) {
                setPayments(data.payments || []);
            }
        } catch (err) {

        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (paymentId, action) => {
        setVerifying(prev => ({ ...prev, [paymentId]: action }));
        try {
            const data = await verifyPayment(paymentId, action);
            if (data.success) {
                setPayments(prev => prev.filter(p => p._id !== paymentId));
            }
        } catch (err) {

        } finally {
            setVerifying(prev => ({ ...prev, [paymentId]: null }));
            setPreviewSlip(null);
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
            {/* Header */}
            <div className="payment-header">
                <button className="back-btn" onClick={onBack}>
                    <ChevronLeft size={24} />
                </button>
                <h1>ตรวจสลิปการชำระเงิน</h1>
                {payments.length > 0 && (
                    <span className="payment-count">{payments.length}</span>
                )}
            </div>

            {payments.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">✅</span>
                    <p>ไม่มีสลิปรอตรวจสอบ</p>
                </div>
            ) : (
                <div className="payment-list">
                    {payments.map((payment) => (
                        <div key={payment._id} className="payment-card">
                            {/* Ticket Info Header */}
                            <div className="payment-ticket-info">
                                <span className="ticket-code-badge">
                                    🎫 {payment.ticket_code || '----'}
                                </span>
                                <span className={`type-badge ${payment.queue_type === 'walkin' ? 'walkin' : 'online'}`}>
                                    {payment.queue_type === 'walkin' ? 'Walk-in' : payment.queue_type === 'online_paid' ? 'Online (จ่ายแล้ว)' : 'Online (ค้าง)'}
                                </span>
                            </div>

                            {/* Passenger Info */}
                            <div className="payment-passenger">
                                <span className="passenger-icon">👤</span>
                                <span className="passenger-name">{payment.passenger_name || 'ไม่ระบุชื่อ'}</span>
                                {payment.amount > 0 && (
                                    <span className="payment-amount">฿{payment.amount}</span>
                                )}
                            </div>

                            {/* Payment Status */}
                            <div className="payment-status-row">
                                <span className={`payment-status ${payment.payment_status}`}>
                                    {payment.payment_status === 'pending' ? '🔸 รอตรวจ' :
                                        payment.payment_status === 'unpaid' ? '🔴 ยังไม่จ่าย' :
                                            payment.payment_status === 'verified' ? '✅ ตรวจแล้ว' :
                                                payment.payment_status}
                                </span>
                            </div>

                            {/* Slip Image */}
                            {payment.slip_url && (
                                <div className="slip-preview-area" onClick={() => setPreviewSlip(payment)}>
                                    <img
                                        src={payment.slip_url}
                                        alt="Payment slip"
                                        className="slip-thumbnail"
                                        loading="lazy"
                                    />
                                    <span className="slip-hint">แตะเพื่อดูเต็ม</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="payment-actions">
                                <button
                                    className="btn-approve"
                                    onClick={() => handleVerify(payment._id, 'approve')}
                                    disabled={verifying[payment._id]}
                                >
                                    {verifying[payment._id] === 'approve' ? '...' : '✓ อนุมัติ'}
                                </button>
                                <button
                                    className="btn-reject"
                                    onClick={() => handleVerify(payment._id, 'reject')}
                                    disabled={verifying[payment._id]}
                                >
                                    {verifying[payment._id] === 'reject' ? '...' : '✕ ปฏิเสธ'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Full Slip Preview Modal */}
            {previewSlip && (
                <div className="slip-modal-overlay" onClick={() => setPreviewSlip(null)}>
                    <div className="slip-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="slip-modal-header">
                            <div className="slip-ticket-detail">
                                <span className="ticket-code-badge large">🎫 {previewSlip.ticket_code || '----'}</span>
                                <span className="slip-passenger-name">{previewSlip.passenger_name || 'ไม่ระบุชื่อ'}</span>
                            </div>
                            <button className="slip-close-btn" onClick={() => setPreviewSlip(null)}>✕</button>
                        </div>
                        <img
                            src={previewSlip.slip_url}
                            alt="Payment slip full"
                            className="slip-full-image"
                        />
                        <div className="slip-modal-actions">
                            <button
                                className="btn-approve large"
                                onClick={() => handleVerify(previewSlip._id, 'approve')}
                                disabled={verifying[previewSlip._id]}
                            >
                                {verifying[previewSlip._id] === 'approve' ? '...' : '✓ อนุมัติ'}
                            </button>
                            <button
                                className="btn-reject large"
                                onClick={() => handleVerify(previewSlip._id, 'reject')}
                                disabled={verifying[previewSlip._id]}
                            >
                                {verifying[previewSlip._id] === 'reject' ? '...' : '✕ ปฏิเสธ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
