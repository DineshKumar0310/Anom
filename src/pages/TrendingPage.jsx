import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { postService } from '../services/postService';
import { useAuth } from '../context/AuthContext';

export default function TrendingPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchTrending();
    }, []);

    const fetchTrending = async () => {
        setLoading(true);
        try {
            const response = await postService.getTrending({ page: 0, size: 10 });
            setPosts(response.data.data.content || []);
        } catch (err) {
            console.error('Failed to load trending:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content">
            <h1 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🔥 Trending Posts
            </h1>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Top 10 most viewed posts right now
            </p>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading trending posts...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <h3>No trending posts yet</h3>
                </div>
            ) : (
                <div>
                    {posts.map((post, index) => (
                        <div key={post.id} style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '-40px',
                                top: '20px',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: index < 3 ? 'var(--accent)' : 'var(--text-muted)'
                            }}>
                                #{index + 1}
                            </div>
                            <PostCard post={post} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
