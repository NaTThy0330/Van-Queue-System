/**
 * Payment Verification Page
 * Verify payment slips from passengers
 */
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getPendingPayments, verifyPayment } from '../services/api';
import './PaymentVerification.css';

export default function PaymentVerification({ trip, onBack }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [previewSlip, setPreviewSlip] = useState(null);

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
            console.error('Load payments error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (paymentId, action) => {
        setActionLoading(prev => ({ ...prev, [paymentId]: action }));
        try {
            const data = await verifyPayment(paymentId, action);
            if (data.success) {
                setPayments(prev => prev.filter(p => p._id !== paymentId));
                setPreviewSlip(null);
            }
        } catch (err) {
            console.error('Verify error:', err);
            alert('ดำเนินการไม่สำเร็จ');
        } finally {
            setActionLoading(prev => ({ ...prev, [paymentId]: null }));
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
                <h1>ตรวจสอบการชำระเงิน</h1>
            </div>

            {/* Summary */}
            <div className="summary-bar">
                <span>รอตรวจสอบ: <strong>{payments.length}</strong> รายการ</span>
            </div>

            {/* Payment List */}
            {payments.length > 0 ? (
                <div className="payment-list">
                    {payments.map((payment) => (
                        <div key={payment._id} className="payment-card">
                            <div className="payment-info">
                                <span className="passenger-name">
                                    {payment.passenger_name || payment.queue_id?.passenger_name || 'ไม่ระบุชื่อ'}
                                </span>
                                <span className="amount">฿{payment.amount || 0}</span>
                            </div>

                            {payment.slip_url && (
                                <div
                                    className="slip-preview"
                                    onClick={() => setPreviewSlip(payment)}
                                >
                                    <img src={payment.slip_url} alt="Slip" />
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
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p>✅ ไม่มีสลิปรอตรวจสอบ</p>
                </div>
            )}

            {/* Slip Preview Modal */}
            {previewSlip && (
                <div className="slip-modal" onClick={() => setPreviewSlip(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <img src={previewSlip.slip_url} alt="Slip Full" />
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
