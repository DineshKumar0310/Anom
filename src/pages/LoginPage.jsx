import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            showToast('Login successful! Welcome back.');
            navigate('/feed');
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Login failed';
            if (message.includes('banned')) {
                setError(message);
                showToast(message, 'error');
            } else {
                setError(message);
                showToast('Login failed', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <Link to="/" className="navbar-logo" style={{ fontSize: '2rem' }}>
                        <span>🎭</span>
                        AnonBoard
                    </Link>
                </div>

                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Login to continue anonymously</p>

                {error && (
                    <div className="error-message" style={{
                        background: error.includes('banned') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                        padding: error.includes('banned') ? '16px' : '12px 16px'
                    }}>
                        {error.includes('banned') && <div style={{ fontWeight: '600', marginBottom: '4px' }}>🚫 Account Banned</div>}
                        {error}
                    </div>
                )}

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

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--accent)' }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
