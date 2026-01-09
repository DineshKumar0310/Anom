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

    const [passwordValidations, setPasswordValidations] = useState({
        length: false,
        lower: false,
        upper: false,
        number: false,
        special: false
    });
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const updatePassword = (val) => {
        setPassword(val);
        setPasswordValidations({
            length: val.length >= 8,
            lower: /[a-z]/.test(val),
            upper: /[A-Z]/.test(val),
            number: /[0-9]/.test(val),
            special: /[@#$%^&+=!]/.test(val)
        });
    };

    const validatePassword = (pwd) => {
        const checks = {
            length: pwd.length >= 8,
            lower: /[a-z]/.test(pwd),
            upper: /[A-Z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            special: /[@#$%^&+=!]/.test(pwd)
        };
        return Object.values(checks).every(Boolean) ? null : "Password does not meet requirements.";
    };

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
            await register(email, password, selectedAvatar);
            showToast('Verification code sent to your email!');
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
                            onChange={(e) => updatePassword(e.target.value)}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)} // Or keep checks visible if improved validation UX desired
                            placeholder="Create a strong password"
                            style={{
                                borderColor: isPasswordFocused
                                    ? Object.values(passwordValidations).every(Boolean) ? '#10B981' : 'var(--accent)'
                                    : 'var(--border)'
                            }}
                            required
                        />
                        {/* Real-time Validation Checks */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            marginTop: '8px',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)'
                        }}>
                            <div style={{ color: passwordValidations.length ? '#10B981' : 'inherit' }}>
                                {passwordValidations.length ? '✓' : '○'} 8+ Characters
                            </div>
                            <div style={{ color: passwordValidations.upper ? '#10B981' : 'inherit' }}>
                                {passwordValidations.upper ? '✓' : '○'} Uppercase
                            </div>
                            <div style={{ color: passwordValidations.lower ? '#10B981' : 'inherit' }}>
                                {passwordValidations.lower ? '✓' : '○'} Lowercase
                            </div>
                            <div style={{ color: passwordValidations.number ? '#10B981' : 'inherit' }}>
                                {passwordValidations.number ? '✓' : '○'} Number
                            </div>
                            <div style={{ color: passwordValidations.special ? '#10B981' : 'inherit' }}>
                                {passwordValidations.special ? '✓' : '○'} Special Chars
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            style={{
                                borderColor: confirmPassword && password !== confirmPassword ? '#EF4444' :
                                    confirmPassword && password === confirmPassword ? '#10B981' : 'var(--border)'
                            }}
                            required
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <div style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '4px' }}>
                                ⚠ Passwords do not match
                            </div>
                        )}
                        {confirmPassword && password === confirmPassword && (
                            <div style={{ color: '#10B981', fontSize: '0.8rem', marginTop: '4px' }}>
                                ✓ Passwords match
                            </div>
                        )}
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
