import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { postService } from '../services/postService';
import { useToast } from '../components/Toast';

const POPULAR_TAGS = ['placements', 'exams', 'projects', 'internships', 'general', 'dsa', 'interview'];

export default function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();

    const tag = searchParams.get('tag') || '';
    const sort = searchParams.get('sort') || 'latest';
    const query = searchParams.get('q') || '';

    useEffect(() => {
        fetchPosts();
    }, [tag, sort, query]);

    const fetchPosts = async () => {
        setLoading(true);
        setError('');

        try {
            let response;
            if (query) {
                response = await postService.searchPosts(query, { page: 0, size: 20 });
            } else {
                const params = { sort, page: 0, size: 20 };
                if (tag) params.tag = tag;
                response = await postService.getPosts(params);
            }
            setPosts(response.data.data.content || []);
        } catch (err) {
            setError('Failed to load posts. Please try again.');
            showToast('Failed to load posts', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTagChange = (newTag) => {
        const params = new URLSearchParams(searchParams);
        params.delete('q');
        if (newTag === tag) {
            params.delete('tag');
        } else {
            params.set('tag', newTag);
        }
        setSearchParams(params);
    };

    const handleSortChange = (newSort) => {
        const params = new URLSearchParams(searchParams);
        params.set('sort', newSort);
        setSearchParams(params);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery.trim()) {
            params.set('q', searchQuery.trim());
            showToast(`Searching for "${searchQuery.trim()}"`);
        }
        setSearchParams(params);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchParams({});
    };

    return (
        <div className="main-content">
            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="🔍 Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: '1 1 200px', minWidth: '0' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button type="submit" className="btn btn-primary">Search</button>
                        {query && (
                            <button type="button" className="btn btn-secondary" onClick={clearSearch}>
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {query && (
                <div style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                    Showing results for: <strong>"{query}"</strong>
                </div>
            )}

            {/* Tag Filters */}
            {!query && (
                <div className="category-filters">
                    {POPULAR_TAGS.map((t) => (
                        <button
                            key={t}
                            className={`category-btn ${tag === t ? 'active' : ''}`}
                            onClick={() => handleTagChange(t)}
                        >
                            #{t}
                        </button>
                    ))}
                </div>
            )}

            {/* Sort Toggle */}
            <div className="sort-toggle">
                <button
                    className={`sort-btn ${sort === 'latest' ? 'active' : ''}`}
                    onClick={() => handleSortChange('latest')}
                >
                    🕐 Latest
                </button>
                <button
                    className={`sort-btn ${sort === 'top' ? 'active' : ''}`}
                    onClick={() => handleSortChange('top')}
                >
                    🔝 Top
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading posts...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <h3>No posts yet</h3>
                    <p>{query ? 'Try a different search term' : 'Be the first to start a discussion!'}</p>
                </div>
            ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
        </div>
    );
}
