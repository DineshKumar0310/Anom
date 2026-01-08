import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { AVATARS } from '../components/Avatar';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('avatar_01');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            showToast('Password too short', 'error');
            return;
        }

        setLoading(true);

        try {
            await signup(email, password, selectedAvatar);
            showToast('Account created! Welcome to AnonBoard.');
            navigate('/feed');
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Signup failed. Please try again.';
            setError(message);
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '500px' }}>
            <h1 className="auth-title">🎭 Join AnonBoard</h1>
            <p className="auth-subtitle">Create an account to discuss anonymously</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Choose Your Avatar</label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '10px',
                        marginBottom: '16px'
                    }}>
                        {AVATARS.map((avatar) => (
                            <button
                                key={avatar.id}
                                type="button"
                                onClick={() => setSelectedAvatar(avatar.id)}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    background: avatar.color,
                                    border: selectedAvatar === avatar.id ? '3px solid var(--accent)' : '2px solid var(--border)',
                                    cursor: 'pointer',
                                    fontSize: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.2s, border 0.2s',
                                    transform: selectedAvatar === avatar.id ? 'scale(1.1)' : 'scale(1)',
                                }}
                            >
                                {avatar.emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">College Email</label>
                    <input
                        type="email"
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@college.edu"
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
                        placeholder="Minimum 6 characters"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        className="form-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Anonymous Account'}
                </button>
            </form>

            <p className="auth-footer">
                Already have an account? <Link to="/login">Sign in</Link>
            </p>

            <p style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                🔒 Your real identity will never be shown to other users
            </p>
        </div>
    );
}
