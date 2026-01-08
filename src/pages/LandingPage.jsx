import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, var(--bg-primary) 0%, #1a1a2e 100%)'
        }}>
            <div style={{ marginBottom: '32px', fontSize: '5rem' }}>🎭</div>

            <h1 style={{
                fontSize: '3rem',
                fontWeight: '800',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
            }}>
                AnonBoard
            </h1>

            <p style={{
                fontSize: '1.3rem',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                marginBottom: '40px',
                lineHeight: '1.8'
            }}>
                The anonymous discussion platform for students.<br />
                <span style={{ color: 'var(--accent)' }}>Real conversations. Hidden identities.</span>
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: '60px' }}>
                <div className="card" style={{ maxWidth: '200px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💼</div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Placements</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Interview tips & experiences</p>
                </div>
                <div className="card" style={{ maxWidth: '200px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📚</div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Exams</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Study tips & resources</p>
                </div>
                <div className="card" style={{ maxWidth: '200px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🚀</div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Projects</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Collaborate & get help</p>
                </div>
                <div className="card" style={{ maxWidth: '200px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Internships</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Opportunities & reviews</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
                    Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
                    Sign In
                </Link>
            </div>

            <div style={{ marginTop: '60px', display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>🔒</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Identity protected
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>⚡</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Real-time voting
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>🎓</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Student-only
                    </p>
                </div>
            </div>
        </div>
    );
}
