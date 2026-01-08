import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PremiumPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (user?.isPremium) {
        return (
            <div className="main-content">
                <div className="auth-container" style={{ marginTop: '60px' }}>
                    <h1 className="auth-title">⭐ You're Premium!</h1>
                    <p className="auth-subtitle">Thank you for supporting AnonBoard</p>

                    <div className="card" style={{ marginTop: '20px', textAlign: 'left' }}>
                        <h3 style={{ marginBottom: '12px' }}>Your Premium Benefits:</h3>
                        <ul style={{ lineHeight: '2', color: 'var(--text-secondary)' }}>
                            <li>✅ Unlimited posts</li>
                            <li>✅ Priority support</li>
                            <li>✅ No ads (coming soon)</li>
                            <li>✅ Verified badge (coming soon)</li>
                        </ul>
                    </div>

                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%', marginTop: '20px' }}
                        onClick={() => navigate('/feed')}
                    >
                        Back to Feed
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="auth-container" style={{ marginTop: '60px', maxWidth: '500px' }}>
                <h1 className="auth-title">⭐ Upgrade to Premium</h1>
                <p className="auth-subtitle">Unlock unlimited posting and exclusive features</p>

                <div className="card" style={{ marginTop: '20px', textAlign: 'left' }}>
                    <h3 style={{ marginBottom: '12px' }}>Premium Features:</h3>
                    <ul style={{ lineHeight: '2', color: 'var(--text-secondary)' }}>
                        <li>✨ <strong>Unlimited posts</strong> - express yourself freely</li>
                        <li>🎯 <strong>Priority support</strong> - get help faster</li>
                        <li>🚀 <strong>Early access</strong> to new features</li>
                        <li>📊 <strong>Advanced analytics</strong> (coming soon)</li>
                        <li>🎨 <strong>Custom themes</strong> (coming soon)</li>
                    </ul>
                </div>

                <div className="card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, var(--accent), #a855f7)', color: 'white', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '8px' }}>₹99/month</h2>
                    <p style={{ opacity: 0.9 }}>Cancel anytime</p>
                </div>

                {user && (
                    <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <p>Current usage: {user.totalPosts}/{user.freePostLimit} free posts</p>
                        <p style={{ marginTop: '8px' }}>
                            Posts remaining: <strong style={{ color: user.postsRemaining === 0 ? 'var(--danger)' : 'var(--success)' }}>
                                {user.postsRemaining}
                            </strong>
                        </p>
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '20px', padding: '14px', fontSize: '1.1rem' }}
                    onClick={() => alert('Payment integration coming soon!\n\nFor demo purposes, contact admin to upgrade your account.')}
                >
                    🎁 Upgrade Now
                </button>

                <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: '12px' }}
                    onClick={() => navigate('/feed')}
                >
                    Maybe Later
                </button>

                <p style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    💡 Premium helps us keep AnonBoard running and ad-free
                </p>
            </div>
        </div>
    );
}
