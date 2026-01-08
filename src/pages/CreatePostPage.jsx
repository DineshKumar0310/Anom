import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const SUGGESTED_TAGS = ['placements', 'exams', 'projects', 'internships', 'general', 'dsa', 'interview', 'tips', 'help'];

export default function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, refreshUser, isPremium } = useAuth();
    const { showToast } = useToast();

    // Premium users have unlimited posts
    const canPost = isPremium || (user?.postsRemaining > 0);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                showToast('Image must be less than 5MB', 'error');
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddTag = (tag) => {
        const normalized = tag.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (normalized && !tags.includes(normalized) && tags.length < 5) {
            setTags([...tags, normalized]);
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag(tagInput);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (title.length < 5) {
            setError('Title must be at least 5 characters');
            return;
        }

        if (content.length < 10) {
            setError('Content must be at least 10 characters');
            return;
        }

        if (!canPost) {
            setError('You have reached your free post limit. Upgrade to premium for unlimited posts.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('post', JSON.stringify({ title, content, tags }));
            if (image) {
                formData.append('image', image);
            }

            const response = await postService.createPost(formData);
            await refreshUser();
            showToast('Post created successfully!');
            navigate(`/post/${response.data.data.id}`);
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Failed to create post';
            setError(message);
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content">
            <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '24px' }}>Create a Post</h2>

                {!canPost && !isPremium && (
                    <div className="error-message" style={{ marginBottom: '20px' }}>
                        ⚠️ You've used all {user?.freePostLimit} free posts.
                        <button
                            className="btn btn-primary btn-sm"
                            style={{ marginLeft: '12px' }}
                            onClick={() => navigate('/premium')}
                        >
                            Upgrade to Premium
                        </button>
                    </div>
                )}

                {isPremium && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>⭐</span>
                        <span style={{ color: '#f59e0b', fontWeight: '600' }}>Premium Account - Unlimited Posts</span>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Tags (up to 5)</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                            {tags.map(tag => (
                                <span
                                    key={tag}
                                    style={{
                                        background: 'var(--accent)',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    #{tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            className="form-input"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Type a tag and press Enter..."
                            disabled={tags.length >= 5}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                            {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 6).map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleAddTag(tag)}
                                    className="category-btn"
                                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's your question or topic?"
                            maxLength={300}
                            required
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {title.length}/300 characters
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Content</label>
                        <textarea
                            className="form-input form-textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your thoughts, ask questions, or start a discussion..."
                            maxLength={10000}
                            style={{ minHeight: '200px' }}
                            required
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {content.length}/10000 characters
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Image (optional, max 5MB)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="form-input"
                        />
                        {imagePreview && (
                            <div style={{ marginTop: '10px' }}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImage(null);
                                        setImagePreview('');
                                    }}
                                    className="btn btn-secondary btn-sm"
                                    style={{ marginTop: '8px' }}
                                >
                                    Remove Image
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/feed')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading || !canPost}>
                            {loading ? 'Posting...' : '🎭 Post Anonymously'}
                        </button>
                    </div>
                </form>

                <p style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    ⏰ You can edit this post for 10 minutes after posting
                    {!isPremium && user?.postsRemaining > 0 && (
                        <span> • {user.postsRemaining} free posts remaining</span>
                    )}
                </p>
            </div>
        </div>
    );
}
