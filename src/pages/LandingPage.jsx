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
            <div style={{ marginBottom: '24px', fontSize: 'clamp(3rem, 10vw, 5rem)' }}>🎭</div>

            <h1 className="landing-hero-title" style={{
                fontSize: 'clamp(1.8rem, 6vw, 3rem)',
                fontWeight: '800',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
            }}>
                AnonBoard
            </h1>

            <p className="landing-hero-subtitle" style={{
                fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                marginBottom: '32px',
                lineHeight: '1.8',
                padding: '0 16px'
            }}>
                The anonymous discussion platform for students.<br />
                <span style={{ color: 'var(--accent)' }}>Real conversations. Hidden identities.</span>
            </p>

            <div className="landing-feature-cards" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'center',
                marginBottom: '40px',
                padding: '0 16px',
                width: '100%',
                maxWidth: '900px'
            }}>
                <div className="card landing-feature-card" style={{ flex: '1 1 180px', maxWidth: '200px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💼</div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Placements</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Interview tips & experiences</p>
                </div>
                <div className="card landing-feature-card" style={{ flex: '1 1 180px', maxWidth: '200px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📚</div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Exams</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Study tips & resources</p>
                </div>
                <div className="card landing-feature-card" style={{ flex: '1 1 180px', maxWidth: '200px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🚀</div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Projects</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Collaborate & get help</p>
                </div>
                <div className="card landing-feature-card" style={{ flex: '1 1 180px', maxWidth: '200px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Internships</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Opportunities & reviews</p>
                </div>
            </div>

            <div className="landing-cta-buttons" style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '400px',
                padding: '0 16px'
            }}>
                <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem', flex: '1 1 auto', textAlign: 'center' }}>
                    Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1.1rem', flex: '1 1 auto', textAlign: 'center' }}>
                    Sign In
                </Link>
            </div>

            <div className="landing-features-grid" style={{
                marginTop: '48px',
                display: 'flex',
                gap: '32px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                padding: '0 16px'
            }}>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>🔒</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Identity protected
                    </p>
                </div>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>⚡</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Real-time voting
                    </p>
                </div>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>🎓</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Student-only
                    </p>
                </div>
            </div>
        </div>
    );
}

