import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout, isAdmin, isPremium } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-content">
                    <Link to="/feed" className="navbar-logo" onClick={closeMobileMenu}>
                        <span>🎭</span>
                        AnonBoard
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>

                    {/* Navigation Links */}
                    <div className={`navbar-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                        <Link to="/feed" className="nav-link" onClick={closeMobileMenu}>Feed</Link>
                        <Link to="/jobs" className="nav-link" onClick={closeMobileMenu}>💼 Jobs</Link>
                        <Link to="/trending" className="nav-link" onClick={closeMobileMenu}>🔥 Trending</Link>
                        <Link to="/my-posts" className="nav-link" onClick={closeMobileMenu}>📝 My Posts</Link>
                        {isAdmin && <Link to="/admin" className="nav-link" onClick={closeMobileMenu}>⚙️ Admin</Link>}
                        <Link to="/create" className="btn btn-primary btn-sm" onClick={closeMobileMenu}>
                            + Create Post
                        </Link>

                        {/* Mobile User Info */}
                        <div className="mobile-only" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    🔒 {user?.anonymousName}
                                </span>
                                {isPremium && (
                                    <span style={{
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        fontWeight: '600'
                                    }}>
                                        ⭐ PREMIUM
                                    </span>
                                )}
                            </div>
                            {!isPremium && (
                                <Link
                                    to="/premium"
                                    className="btn btn-sm"
                                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', width: '100%', justifyContent: 'center', marginBottom: '8px' }}
                                    onClick={closeMobileMenu}
                                >
                                    ⭐ Upgrade to Premium
                                </Link>
                            )}
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Desktop User Menu */}
                    <div className="user-menu desktop-only">
                        <span className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            🔒 {user?.anonymousName}
                            {isPremium && (
                                <span style={{
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: '600'
                                }}>
                                    ⭐ PREMIUM
                                </span>
                            )}
                        </span>
                        {!isPremium && (
                            <Link to="/premium" className="btn btn-sm" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
                                ⭐ Upgrade
                            </Link>
                        )}
                        <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            />
        </>
    );
}
