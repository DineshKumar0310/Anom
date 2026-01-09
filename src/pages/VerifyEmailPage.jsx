import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../components/Toast';

export default function VerifyEmailPage() {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { verifyEmail } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // If no email in state, redirect to signup or ask for it?
            // For now, redirect to login
            navigate('/login');
        }
    }, [location, navigate]);

    const handleResend = async () => {
        try {
            await api.post('/auth/resend-otp', { email });
            showToast('Code sent again!', 'success');
        } catch (err) {
            showToast('Failed to resend code', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await verifyEmail(email, otp);
            showToast('Email verified successfully! Please login.', 'success');
            navigate('/login');
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Verification failed';
            showToast(message, 'error');
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
                    <h2 style={{ fontSize: '1.8rem' }}>Verify Email</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Enter the code sent to {email}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Verification Code (OTP)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
                    Didn't receive code?{' '}
                    <button
                        type="button"
                        onClick={handleResend}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent)',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Resend Code
                    </button>
                </p>

                <p style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Back to Login</Link>
                </p>
            </div>
        </div>
    );
}
