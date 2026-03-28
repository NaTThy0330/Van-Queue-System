import { useState, useEffect } from 'react';
import { getDriverProfile, getShiftStatus, getAvailableVans, selectVan, changeVan } from '../services/api';
import { getDriver, setDriver as saveDriver, removeToken } from '../services/auth';
import './Home.css';

export default function Home({ driver, van, trip, roundsToday, onVanSelected, onSelectTrip, onResumeDashboard, onVanChanged, onLogout }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shiftData, setShiftData] = useState(null);

    const [plateNumber, setPlateNumber] = useState('');
    const [availableVans, setAvailableVans] = useState([]);
    const [vanLoading, setVanLoading] = useState(false);
    const [vanError, setVanError] = useState('');
    const [isEditingVan, setIsEditingVan] = useState(false);

    useEffect(() => {
        loadProfile();
        loadAvailableVans();
    }, []);

    const loadProfile = async () => {
        try {
            const driverId = driver?.id || getDriver()?.id;
            const [profileRes, shiftRes] = await Promise.all([
                getDriverProfile(),
                driverId ? getShiftStatus(driverId) : null
            ]);
            if (profileRes.success) setProfile(profileRes);
            if (shiftRes?.success) setShiftData(shiftRes.shift);
        } catch (err) {
            console.error('Profile load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableVans = async () => {
        try {
            const data = await getAvailableVans();
            if (data.success) setAvailableVans(data.vans || []);
        } catch (err) {
            console.error('Load vans error:', err);
        }
    };

    const handleLogout = () => { removeToken(); onLogout(); };

    const handleSelectVan = async (plate) => {
        setVanLoading(true);
        setVanError('');
        try {
            const driverId = driver?.id || getDriver()?.id;
            const data = await selectVan(driverId, plate);
            if (data.success) {
                const updatedDriver = { ...getDriver(), van: data.van };
                saveDriver(updatedDriver);
                onVanSelected(data.van);
            } else {
                setVanError(data.error || 'เลือกรถไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Select van error:', err);
            if (err.response?.data?.code === 'VAN_NOT_AVAILABLE') {
                setVanError('รถคันนี้ไม่ว่าง กำลังใช้งานอยู่');
            } else {
                setVanError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
            }
        } finally {
            setVanLoading(false);
        }
    };

    const handleChangeVan = async () => {
        if (!plateNumber.trim()) return;
        setVanLoading(true);
        setVanError('');
        try {
            const driverId = driver?.id || getDriver()?.id;
            const data = await changeVan(driverId, plateNumber.trim().toUpperCase());
            if (data.success) {
                onVanChanged(data.van);
                setIsEditingVan(false);
                setPlateNumber('');
                loadProfile();
            } else {
                setVanError(data.error || 'เปลี่ยนรถไม่สำเร็จ');
            }
        } catch (err) {
            setVanError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        } finally {
            setVanLoading(false);
        }
    };

    const suggestions = plateNumber.trim()
        ? availableVans.filter(v => v.plate_number.includes(plateNumber.toUpperCase()))
        : availableVans;
    const exactMatch = suggestions.find(v => v.plate_number === plateNumber.toUpperCase());

    if (loading) {
        return (
            <div className="home-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    const driverInfo = profile?.driver || driver || getDriver();
    const vanInfo = van || profile?.van_info;
    const currentTrip = profile?.current_trip || trip;
    const rounds = shiftData?.rounds_today ?? roundsToday ?? 0;
    const maxRounds = shiftData?.van?.max_rounds ?? 10;
    const hasBoundVan = !!vanInfo;

    return (
        <div className="home-container">
            {/* Header */}
            <div className="home-header">
                <div className="driver-avatar">
                    {driverInfo?.name?.charAt(0) || '?'}
                </div>
                <div className="driver-info">
                    <h2>{driverInfo?.name || 'คนขับ'}</h2>
                    <span className={`status-badge ${hasBoundVan ? 'on-duty' : 'off-duty'}`}>
                        {hasBoundVan ? '🟢 กำลังปฏิบัติงาน' : '⚪ ยังไม่เริ่มงาน'}
                    </span>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    ออกจากระบบ
                </button>
            </div>

            {hasBoundVan && (
                <div className="shift-info-card">
                    <div className="shift-header">
                        <span className="shift-icon">📊</span>
                        <span className="shift-title">สรุปกะวันนี้</span>
                    </div>
                    <div className="shift-stats">
                        <div className="stat-item">
                            <span className="stat-value">{rounds}</span>
                            <span className="stat-label">รอบที่วิ่งแล้ว</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">{maxRounds}</span>
                            <span className="stat-label">รอบสูงสุด</span>
                        </div>
                    </div>
                </div>
            )}

            {hasBoundVan && !isEditingVan ? (
                <>
                    <div className="van-card active">
                        <div className="van-icon">🚐</div>
                        <div className="van-details">
                            <h3>{vanInfo.plate_number}</h3>
                            <p>ที่นั่ง {vanInfo.seat_capacity || 13} ที่</p>
                        </div>
                        <span className="van-status-badge on-duty">ผูกอยู่วันนี้</span>
                    </div>

                    <div className="change-van-section">
                        <button className="btn-change-van" onClick={() => setIsEditingVan(true)}>
                            🔄 เปลี่ยนรถ
                        </button>
                    </div>

                    <div className="guidance-text">
                        💡 กรุณาตรวจสอบทะเบียนรถก่อนเลือกรอบรถ
                    </div>
                </>
            ) : (
                <div className="van-binding-section">
                    <div className="binding-title">
                        <span className="binding-icon">🚐</span>
                        <h3>{isEditingVan ? 'เปลี่ยนรถคันใหม่' : 'ผูกรถประจำวัน'}</h3>
                    </div>

                    <p className="binding-subtitle">
                        {isEditingVan
                            ? 'พิมพ์ทะเบียนรถคันใหม่ที่ต้องการใช้'
                            : 'กรุณาเลือกหรือพิมพ์ทะเบียนรถที่จะใช้งานวันนี้'
                        }
                    </p>

                    <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                        placeholder="พิมพ์ทะเบียนรถ... (เช่น กข 1234)"
                        maxLength={12}
                        disabled={vanLoading}
                        className="plate-input"
                        autoFocus
                    />

                    {vanError && <div className="error-message">{vanError}</div>}

                    <div className="van-list">
                        {suggestions.map((v) => (
                            <div
                                key={v._id}
                                className="van-item available"
                                onClick={() => isEditingVan
                                    ? (() => { setPlateNumber(v.plate_number); })()
                                    : handleSelectVan(v.plate_number)
                                }
                            >
                                <span className="van-plate">{v.plate_number}</span>
                                <span className="van-status-text">ว่าง — {v.seat_capacity || 13} ที่นั่ง</span>
                                <span className="action-arrow">{isEditingVan ? 'เลือก' : 'ยืนยันและไป →'}</span>
                            </div>
                        ))}

                        {plateNumber.trim() && !exactMatch && (
                            <div
                                className="van-item new-van"
                                onClick={() => isEditingVan ? null : handleSelectVan(plateNumber.toUpperCase())}
                            >
                                <span className="van-plate">{plateNumber.toUpperCase()}</span>
                                <span className="van-status-text new">✨ ทะเบียนใหม่</span>
                                {!isEditingVan && <span className="action-arrow">ใช้ทะเบียนนี้ +</span>}
                            </div>
                        )}

                        {!plateNumber.trim() && availableVans.length === 0 && (
                            <div className="empty-state-text">
                                ยังไม่มีรถว่างในระบบ พิมพ์ทะเบียนเพื่อเริ่มใช้งานได้เลย
                            </div>
                        )}
                    </div>

                    {isEditingVan && (
                        <div className="binding-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => { setIsEditingVan(false); setPlateNumber(''); setVanError(''); }}
                                disabled={vanLoading}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="btn-confirm-van"
                                onClick={handleChangeVan}
                                disabled={vanLoading || !plateNumber.trim()}
                            >
                                {vanLoading ? '...' : 'ยืนยันเปลี่ยน'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {currentTrip && (
                <div className="current-trip-card">
                    <h3>🚀 รอบปัจจุบัน</h3>
                    <div className="trip-info">
                        <p className="route">{currentTrip.route?.route_name}</p>
                        <p className="time">
                            {new Date(currentTrip.departure_time).toLocaleTimeString('th-TH', {
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
            )}

            <div className="home-actions">
                {hasBoundVan && !isEditingVan && (
                    !currentTrip ? (
                        <button className="btn-primary" onClick={onSelectTrip}>
                            📋 ยืนยันรถและไปที่คิวรถ
                        </button>
                    ) : (
                        <button className="btn-primary" onClick={onResumeDashboard}>
                            📊 กลับไปจัดการคิวรถ
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
