/**
 * WalkInTicketModal — Virtual Ticket for Walk-in Passengers
 * Shows a beautiful ticket pop-up with QR-like code after successful walk-in
 * Passenger can photograph this as proof of boarding
 */
import { useEffect, useRef, useState } from 'react';
import './WalkInTicketModal.css';

/**
 * Generate a deterministic QR-like pattern on canvas
 * Uses ticket data as seed for the pattern
 */
function drawQRPattern(canvas, data) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 160;
    canvas.width = size;
    canvas.height = size;

    const cellSize = 8;
    const gridSize = size / cellSize; // 20x20

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Generate deterministic pattern from data string
    let seed = 0;
    for (let i = 0; i < data.length; i++) {
        seed = ((seed << 5) - seed + data.charCodeAt(i)) | 0;
    }
    const pseudoRandom = (i) => {
        const x = Math.sin(seed + i * 127.1) * 43758.5453;
        return x - Math.floor(x);
    };

    // Draw QR-like cells
    ctx.fillStyle = '#1a1a2e';
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Position markers (corners) — always filled
            const isCornerMarker =
                (row < 4 && col < 4) ||
                (row < 4 && col >= gridSize - 4) ||
                (row >= gridSize - 4 && col < 4);

            if (isCornerMarker) {
                // Draw finder pattern borders
                const innerRow = row % (gridSize - (gridSize - 4));
                const innerCol = col < 4 ? col : col - (gridSize - 4);
                const isEdge = innerRow === 0 || innerRow === 3 || innerCol === 0 || innerCol === 3;
                const isCenter = innerRow >= 1 && innerRow <= 2 && innerCol >= 1 && innerCol <= 2;
                if (isEdge || isCenter) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            } else {
                // Random data cells
                if (pseudoRandom(row * gridSize + col) > 0.5) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    // Border
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, size - 2, size - 2);
}

export default function WalkInTicketModal({ ticketData, trip, van, onClose, onCancelTicket }) {
    const canvasRef = useRef(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        if (canvasRef.current && ticketData) {
            const qrData = `TICKET:${trip?._id || ''}:${ticketData.queue_id}:${ticketData.seat_number}`;
            drawQRPattern(canvasRef.current, qrData);
        }
    }, [ticketData, trip]);

    if (!ticketData) return null;

    const departureTime = trip?.departure_time
        ? new Date(trip.departure_time).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        })
        : '--:--';

    const today = new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const routeName = trip?.route_id?.route_name || 'ไม่ระบุเส้นทาง';
    const plateNumber = van?.plate_number || 'ไม่ระบุ';
    const ticketCode = ticketData.ticket_code || 'TK-' + (ticketData.queue_id?.slice(-6) || '000000').toUpperCase();

    return (
        <div className="ticket-overlay" onClick={onClose}>
            <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
                {/* Ticket Header */}
                <div className="ticket-header">
                    <div className="ticket-brand">
                        <span className="brand-icon">🚐</span>
                        <span className="brand-name">VanLine</span>
                    </div>
                    <span className="ticket-type">BOARDING PASS</span>
                </div>

                {/* Tear line */}
                <div className="ticket-tear"></div>

                {/* QR Code Section */}
                <div className="ticket-qr">
                    <canvas ref={canvasRef} className="qr-canvas"></canvas>
                    <p className="qr-hint">สแกนเพื่อยืนยันตัวตน</p>
                </div>

                {/* Ticket Number - prominent */}
                <div className="ticket-number-display">
                    <span className="ticket-number-label">หมายเลขตั๋ว</span>
                    <span className="ticket-number-value">{ticketCode}</span>
                </div>

                {/* Ticket Info Grid */}
                <div className="ticket-info-grid">
                    <div className="ticket-field">
                        <span className="field-label">เส้นทาง</span>
                        <span className="field-value route">{routeName}</span>
                    </div>
                    <div className="ticket-field">
                        <span className="field-label">เวลาออกรถ</span>
                        <span className="field-value time">{departureTime} น.</span>
                    </div>
                    <div className="ticket-field">
                        <span className="field-label">ทะเบียนรถ</span>
                        <span className="field-value plate">{plateNumber}</span>
                    </div>
                    <div className="ticket-field">
                        <span className="field-label">ที่นั่ง</span>
                        <span className="field-value seat">#{ticketData.seat_number}</span>
                    </div>
                </div>

                {/* Tear line */}
                <div className="ticket-tear"></div>

                {/* Footer */}
                <div className="ticket-footer">
                    <p className="ticket-date">{today}</p>
                    <p className="ticket-name">{ticketData.passenger_name}</p>
                    <p className="ticket-id">ID: {ticketData.queue_id?.slice(-8) || '---'}</p>
                </div>

                {/* Close hint */}
                <button className="ticket-close-btn" onClick={onClose}>
                    ✓ ผู้โดยสารถ่ายรูปแล้ว — ปิด
                </button>

                {/* Quick Undo Button */}
                {onCancelTicket && (
                    <button
                        className="ticket-cancel-btn"
                        onClick={async () => {
                            setCancelLoading(true);
                            await onCancelTicket(ticketData.queue_id);
                        }}
                        disabled={cancelLoading}
                    >
                        {cancelLoading ? 'กำลังยกเลิก...' : 'ยกเลิกตั๋วใบนี้ (กดผิด)'}
                    </button>
                )}
            </div>
        </div>
    );
}
