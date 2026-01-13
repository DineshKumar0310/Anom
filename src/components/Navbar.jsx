import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
    const { user, logout, isAdmin, isPremium } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Notification State
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    // Initial fetch and polling
    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 60000); // Poll every 1 min
            return () => clearInterval(interval);
        }
    }, [user, location.pathname]); // Re-fetch on nav change too

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.data);
        } catch (err) {
            console.error("Failed to fetch unread notifications", err);
        }
    };

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const toggleNotifications = () => {
        if (!showNotifications) {
            // When opening, we might want to refresh the list inside the dropdown
            // The dropdown component fetches on mount, so it should be fine.
        }
        setShowNotifications(!showNotifications);
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

                            {/* Mobile Notification Link */}
                            <button
                                className="btn btn-ghost btn-sm"
                                style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px', position: 'relative' }}
                                onClick={() => { setShowNotifications(!showNotifications); }}
                            >
                                🔔 Notifications
                                {unreadCount > 0 && (
                                    <span style={{
                                        background: 'var(--danger)', color: 'white', borderRadius: '50%',
                                        padding: '2px 6px', fontSize: '0.7rem', marginLeft: '8px'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {/* Render dropdown inline for mobile if open */}
                            {showNotifications && (
                                <div className="mobile-notification-wrapper" style={{ maxHeight: '300px', overflowY: 'auto', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '10px' }}>
                                    <NotificationDropdown onClose={() => { setShowNotifications(false); closeMobileMenu(); }} />
                                </div>
                            )}

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
                        {/* Notification Bell */}
                        <div className="notification-bell-container" ref={dropdownRef}>
                            <button className="btn-icon" onClick={toggleNotifications} aria-label="Notifications">
                                🔔
                                {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                            </button>
                            {showNotifications && (
                                <div className="dropdown-menu-container">
                                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                                </div>
                            )}
                        </div>

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
