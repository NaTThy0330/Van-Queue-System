/**
 * Login Page - Driver Authentication
 */
import { useState } from 'react';
import { loginDriver, getDriverProfile } from '../services/api';
import { setToken, setDriver } from '../services/auth';
import './Login.css';

export default function Login({ onLogin, onGoToRegister }) {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!phone || !password) {
            setError('กรุณากรอกข้อมูลให้ครบ');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await loginDriver(phone, password);

            if (data.success) {
                setToken(data.token);
                setDriver(data.driver);
                onLogin(data.driver);
            } else {
                setError(data.error || 'เข้าสู่ระบบล้มเหลว');
            }
        } catch (err) {
            console.error('[Login] Error:', err);
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-icon">🚐</div>
                    <h1>Van Queue</h1>
                    <p>ระบบจัดการรถตู้ - ฝั่งคนขับ</p>
                </div>

                <div className="login-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>หมายเลขโทรศัพท์</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0812345678"
                            maxLength={10}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>รหัสผ่าน</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    <button type="button" className="btn-login" disabled={loading} onClick={handleSubmit}>
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            'เข้าสู่ระบบ'
                        )}
                    </button>

                    {/* Register Link */}
                    <div className="register-link">
                        <span>ยังไม่มีบัญชี?</span>
                        <button type="button" onClick={onGoToRegister}>ลงทะเบียนที่นี่</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

