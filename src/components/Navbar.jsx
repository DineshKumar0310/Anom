import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout, isAdmin, isPremium } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/feed" className="navbar-logo">
                    <span>🎭</span>
                    AnonBoard
                </Link>

                <div className="navbar-nav">
                    <Link to="/feed" className="nav-link">Feed</Link>
                    <Link to="/trending" className="nav-link">🔥 Trending</Link>
                    <Link to="/my-posts" className="nav-link">📝 My Posts</Link>
                    {isAdmin && <Link to="/admin" className="nav-link">⚙️ Admin</Link>}
                    <Link to="/create" className="btn btn-primary btn-sm">
                        + Create Post
                    </Link>
                </div>

                <div className="user-menu">
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
    );
}
