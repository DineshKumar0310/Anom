import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            navigate('/login');
        }
    }, [location, navigate]);

    const validatePassword = (pwd) => {
        const hasLower = /[a-z]/.test(pwd);
        const hasUpper = /[A-Z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasSpecial = /[@#$%^&+=!]/.test(pwd);
        const isLongEnough = pwd.length >= 8;

        if (!isLongEnough) return "Password must be at least 8 characters.";
        if (!hasLower) return "Password must contain a lowercase letter.";
        if (!hasUpper) return "Password must contain an uppercase letter.";
        if (!hasNumber) return "Password must contain a number.";
        if (!hasSpecial) return "Password must contain a special character (@#$%^&+=!).";
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        const pwdError = validatePassword(newPassword);
        if (pwdError) {
            showToast(pwdError, 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            showToast('Password reset successfully! Please login.', 'success');
            navigate('/login');
        } catch (err) {
            showToast(err.response?.data?.error?.message || 'Reset failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, var(--bg-primary) 0%, #1a1a2e 100%)'
        }}>
            <div className="auth-container">
                <div className="auth-header" style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.8rem' }}>Reset Password</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Enter the code and your new password</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            disabled
                            style={{ opacity: 0.7 }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Recovery Code (OTP)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            style={{ letterSpacing: '2px' }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            required
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Must include uppercase, lowercase, number, and special char.
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Cancel</Link>
                </p>
            </div>
        </div>
    );
}
