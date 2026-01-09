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
    const { register } = useAuth(); // Use register instead of signup (which auto-logins)
    const { showToast } = useToast();
    const navigate = useNavigate();

    const validatePassword = (pwd) => {
        // Strict password validation
        const hasLower = /[a-z]/.test(pwd);
        const hasUpper = /[A-Z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasSpecial = /[@#$%^&+=!]/.test(pwd); // Common special chars
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
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            showToast('Passwords do not match', 'error');
            return;
        }

        const pwdError = validatePassword(password);
        if (pwdError) {
            setError(pwdError);
            showToast(pwdError, 'error');
            return;
        }

        setLoading(true);

        try {
            // Register creates user (unverified) and sends OTP
            await register(email, password, selectedAvatar);
            showToast('Verification code sent to your email!');
            // Redirect to verify page with email in state
            navigate('/verify-email', { state: { email } });
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Signup failed. Please try again.';
            setError(message);
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
            <div className="auth-container" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="auth-header" style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <Link to="/" className="navbar-logo" style={{ fontSize: '1.8rem', justifyContent: 'center' }}>
                        <span>🎭</span>
                        AnonBoard
                    </Link>
                </div>

                <h1 className="auth-title">Join AnonBoard</h1>
                <p className="auth-subtitle">Create an account to discuss anonymously</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Choose Your Avatar</label>
                        <div className="avatar-grid" style={{
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
                                        width: '100%',
                                        aspectRatio: '1',
                                        maxWidth: '50px',
                                        borderRadius: '50%',
                                        background: avatar.color,
                                        border: selectedAvatar === avatar.id ? '3px solid var(--accent)' : '2px solid var(--border)',
                                        cursor: 'pointer',
                                        fontSize: 'clamp(1rem, 4vw, 1.5rem)',
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
        </div>
    );
}
