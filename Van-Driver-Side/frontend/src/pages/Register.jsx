/**
 * Register Page - Driver Registration
 */
import { useState } from 'react';
import './Register.css';

export default function Register({ onRegisterSuccess, onGoToLogin }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        license_no: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validateForm = () => {
        const newErrors = {};

        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = 'กรุณากรอกชื่อ-นามสกุล';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'ชื่อต้องมีอย่างน้อย 3 ตัวอักษร';
        }

        // Validate phone
        const phoneRegex = /^[0-9]{10}$/;
        if (!formData.phone) {
            newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
        } else if (!phoneRegex.test(formData.phone.replace(/-/g, ''))) {
            newErrors.phone = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
        }

        // Validate license number
        if (!formData.license_no.trim()) {
            newErrors.license_no = 'กรุณากรอกเลขใบขับขี่';
        } else if (formData.license_no.trim().length < 8) {
            newErrors.license_no = 'เลขใบขับขี่ต้องมีอย่างน้อย 8 ตัวอักษร';
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = 'กรุณากรอกรหัสผ่าน';
        } else if (formData.password.length < 6) {
            newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        }

        // Validate confirm password
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setServerError('');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/driver/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    phone: formData.phone.replace(/-/g, ''),
                    license_no: formData.license_no.trim(),
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ ลงทะเบียนสำเร็จ!\nกรุณาเข้าสู่ระบบด้วยเบอร์โทรและรหัสผ่านที่ตั้งไว้');
                onRegisterSuccess?.();
                onGoToLogin?.();
            } else {
                setServerError(data.error || 'ลงทะเบียนไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Register error:', err);
            setServerError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                {/* Header */}
                <div className="register-header">
                    <div className="logo-icon">🚐</div>
                    <h1>ลงทะเบียนคนขับ</h1>
                    <p>สำหรับคนขับใหม่</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="register-form">
                    {serverError && <div className="error-message server">{serverError}</div>}

                    {/* Name */}
                    <div className="form-group">
                        <label>ชื่อ-นามสกุล <span className="required">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="นายสมชาย ใจดี"
                            disabled={loading}
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label>หมายเลขโทรศัพท์ <span className="required">*</span></label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="0812345678"
                            maxLength={10}
                            disabled={loading}
                            className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="field-error">{errors.phone}</span>}
                        <span className="hint">ใช้สำหรับเข้าสู่ระบบ</span>
                    </div>

                    {/* License Number */}
                    <div className="form-group">
                        <label>เลขที่ใบอนุญาตขับขี่ <span className="required">*</span></label>
                        <input
                            type="text"
                            name="license_no"
                            value={formData.license_no}
                            onChange={handleChange}
                            placeholder="12345678"
                            disabled={loading}
                            className={errors.license_no ? 'error' : ''}
                        />
                        {errors.license_no && <span className="field-error">{errors.license_no}</span>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label>รหัสผ่าน <span className="required">*</span></label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            disabled={loading}
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && <span className="field-error">{errors.password}</span>}
                        <span className="hint">อย่างน้อย 6 ตัวอักษร</span>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label>ยืนยันรหัสผ่าน <span className="required">*</span></label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            disabled={loading}
                            className={errors.confirmPassword ? 'error' : ''}
                        />
                        {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                    </div>

                    {/* Submit */}
                    <button type="submit" className="btn-register" disabled={loading}>
                        {loading ? <span className="loading-spinner"></span> : 'ลงทะเบียน'}
                    </button>

                    {/* Login Link */}
                    <div className="login-link">
                        <span>มีบัญชีอยู่แล้ว?</span>
                        <button type="button" onClick={onGoToLogin}>เข้าสู่ระบบ</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
