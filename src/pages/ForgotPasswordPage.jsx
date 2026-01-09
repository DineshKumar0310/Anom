import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            showToast('Recovery code sent to your email');
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            showToast(err.response?.data?.error?.message || 'Failed to send code', 'error');
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
                    <h2 style={{ fontSize: '1.8rem' }}>Forgot Password</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Enter your email to receive a recovery code</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Recovery Code'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Back to Login</Link>
                </p>
            </div>
        </div>
    );
}
