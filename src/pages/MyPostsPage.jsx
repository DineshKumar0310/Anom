import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { postService } from '../services/postService';

export default function MyPostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchMyPosts();
    }, [page]);

    const fetchMyPosts = async () => {
        setLoading(true);
        try {
            const response = await postService.getMyPosts({ page, size: 20 });
            const data = response.data.data;
            setPosts(prev => page === 0 ? data.content : [...prev, ...data.content]);
            setHasMore(!data.last);
        } catch (err) {
            console.error('Failed to load my posts:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📝 My Posts
                </h1>
                <Link to="/create" className="btn btn-primary">
                    + Create Post
                </Link>
            </div>

            {loading && page === 0 ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading your posts...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <h3>No posts yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Start sharing your thoughts anonymously
                    </p>
                    <Link to="/create" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Create Your First Post
                    </Link>
                </div>
            ) : (
                <>
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}

                    {hasMore && (
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', marginTop: '20px' }}
                            onClick={() => setPage(p => p + 1)}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
