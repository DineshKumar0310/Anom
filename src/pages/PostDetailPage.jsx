import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import VoteButtons from '../components/VoteButtons';
import { AvatarDisplay } from '../components/Avatar';
import { postService, commentService } from '../services/postService';
import ReportModal from '../components/ReportModal';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
}

function CommentCard({ comment, postId, onReplyAdded, onCommentUpdated, onCommentDeleted }) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [localComment, setLocalComment] = useState(comment);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const { showToast } = useToast();

    const fetchReplies = async () => {
        setLoadingReplies(true);
        try {
            const response = await commentService.getReplies(comment.id);
            setReplies(response.data.data);
        } catch (err) {
            showToast('Failed to load replies', 'error');
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleToggleReplies = () => {
        if (!showReplies && replies.length === 0 && localComment.replyCount > 0) {
            fetchReplies();
        }
        setShowReplies(!showReplies);
    };

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setSubmitting(true);
        try {
            await commentService.createComment(postId, replyContent, comment.id);
            setReplyContent('');
            setShowReplyForm(false);
            setLocalComment({ ...localComment, replyCount: localComment.replyCount + 1 });
            fetchReplies();
            setShowReplies(true);
            showToast('Reply added!');
        } catch (err) {
            showToast('Failed to add reply', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editContent.trim()) return;

        setSubmitting(true);
        try {
            await commentService.editComment(localComment.id, editContent);
            setLocalComment({ ...localComment, content: editContent, isEdited: true });
            setIsEditing(false);
            showToast('Comment updated!');
        } catch (err) {
            showToast(err.response?.data?.error?.message || 'Failed to save edit', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this comment?')) return;
        try {
            await commentService.deleteComment(localComment.id);
            showToast('Comment deleted!');
            if (onCommentDeleted) onCommentDeleted(localComment.id);
        } catch (err) {
            showToast('Failed to delete comment', 'error');
        }
    };

    const handleCancelEdit = () => {
        setEditContent(localComment.content);
        setIsEditing(false);
    };

    return (
        <div className="comment-wrapper">
            <div className="comment-card-new">
                <AvatarDisplay avatarId={localComment.authorAvatar} size={36} />

                <div className="comment-body">
                    <div className="comment-header">
                        <span className="comment-author">
                            {localComment.authorAnonymousName}
                            {localComment.isAuthor && (
                                <span style={{
                                    background: 'var(--accent)',
                                    color: 'white',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.65rem',
                                    marginLeft: '6px'
                                }}>
                                    YOU
                                </span>
                            )}
                        </span>
                        <span className="comment-time">{formatTime(localComment.createdAt)}</span>
                        {localComment.isEdited && <span className="edited-badge">Edited</span>}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSaveEdit} style={{ marginTop: '8px' }}>
                            <textarea
                                className="form-input"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                style={{ minHeight: '80px' }}
                                autoFocus
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save'}
                                </button>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="comment-text">{localComment.content}</p>
                    )}

                    <div className="comment-actions">
                        <VoteButtons
                            type="comment"
                            id={localComment.id}
                            voteCount={localComment.voteCount}
                            userVote={localComment.userVote}
                        />

                        {!localComment.parentId && (
                            <button className="action-btn btn-sm" onClick={() => setShowReplyForm(!showReplyForm)}>
                                💬 Reply
                            </button>
                        )}

                        {!localComment.parentId && localComment.replyCount > 0 && (
                            <button className="action-btn btn-sm" onClick={handleToggleReplies}>
                                {showReplies ? '▼' : '▶'} {localComment.replyCount} {localComment.replyCount === 1 ? 'reply' : 'replies'}
                            </button>
                        )}

                        {localComment.isAuthor && localComment.canEdit && !isEditing && (
                            <button className="action-btn btn-sm" onClick={() => setIsEditing(true)}>
                                ✏️ Edit ({Math.floor(localComment.editTimeRemainingSeconds / 60)}m)
                            </button>
                        )}

                        {localComment.isAuthor && (
                            <button className="action-btn btn-sm" onClick={handleDelete} style={{ color: 'var(--danger)' }}>
                                🗑️ Delete
                            </button>
                        )}
                    </div>

                    {showReplyForm && (
                        <form onSubmit={handleSubmitReply} className="reply-form">
                            <textarea
                                className="form-input"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                style={{ minHeight: '60px' }}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !replyContent.trim()}>
                                    {submitting ? 'Posting...' : 'Reply'}
                                </button>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReplyForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {showReplies && (
                <div className="replies-container">
                    {loadingReplies ? (
                        <div style={{ padding: '8px', color: 'var(--text-muted)' }}>Loading replies...</div>
                    ) : (
                        replies.map((reply) => (
                            <CommentCard
                                key={reply.id}
                                comment={reply}
                                postId={postId}
                                onReplyAdded={onReplyAdded}
                                onCommentUpdated={onCommentUpdated}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function ImageModal({ imageUrl, onClose }) {
    if (!imageUrl) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '-40px', right: '0', background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                <img src={imageUrl} alt="Full size" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }} onClick={(e) => e.stopPropagation()} />
            </div>
        </div>
    );
}

export default function PostDetailPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [commenting, setCommenting] = useState(false);
    const [error, setError] = useState('');
    const [commentSort, setCommentSort] = useState('top');
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
    const [editContent, setEditContent] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const { showToast } = useToast();
    const { isAdmin } = useAuth();

    useEffect(() => {
        fetchPost();
    }, [id]);

    useEffect(() => {
        if (post) fetchComments();
    }, [post, commentSort]);

    const fetchPost = async () => {
        try {
            const response = await postService.getPost(id);
            setPost(response.data.data);
            setEditContent(response.data.data.content);
        } catch (err) {
            setError('Post not found');
            showToast('Post not found', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await commentService.getComments(id, { sort: commentSort });
            setComments(response.data.data.content || []);
        } catch (err) {
            showToast('Failed to load comments', 'error');
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setCommenting(true);
        try {
            await commentService.createComment(id, newComment);
            setNewComment('');
            fetchComments();
            setPost({ ...post, commentCount: post.commentCount + 1 });
            showToast('Comment added!');
        } catch (err) {
            showToast('Failed to add comment', 'error');
        } finally {
            setCommenting(false);
        }
    };

    const handleSavePostEdit = async (e) => {
        e.preventDefault();
        if (!editContent.trim()) return;

        setEditSubmitting(true);
        try {
            const response = await postService.editPost(id, { content: editContent });
            setPost(response.data.data);
            setIsEditing(false);
            showToast('Post updated!');
        } catch (err) {
            showToast(err.response?.data?.error?.message || 'Failed to edit post', 'error');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDeletePost = async () => {
        if (!confirm('Delete this post?')) return;
        try {
            await postService.deletePost(id);
            showToast('Post deleted!');
            window.location.href = '/feed';
        } catch (err) {
            showToast('Failed to delete post', 'error');
        }
    };

    const handleCancelPostEdit = () => {
        setEditContent(post.content);
        setIsEditing(false);
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            await postService.share(id);
            setCopied(true);
            showToast('Link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showToast('Failed to copy', 'error');
        }
    };

    const handleReport = async (reportData) => {
        await postService.report(id, reportData);
        showToast('Report submitted!');
    };

    const handleCommentDeleted = (commentId) => {
        setComments(comments.filter(c => c.id !== commentId));
        setPost({ ...post, commentCount: Math.max(0, post.commentCount - 1) });
    };

    if (loading) {
        return <div className="main-content"><div className="loading"><div className="spinner"></div><p>Loading post...</p></div></div>;
    }

    if (error || !post) {
        return (
            <div className="main-content">
                <div className="empty-state">
                    <div className="empty-state-icon">😕</div>
                    <h3>Post not found</h3>
                    <Link to="/feed" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Feed</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <Link to="/feed" className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }}>← Back to Feed</Link>

            <div className="card post-card-no-vote">
                <div className="post-content">
                    {post.tags && post.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {post.tags.map(tag => <Link to={`/feed?tag=${tag}`} key={tag} className="post-category">#{tag}</Link>)}
                        </div>
                    )}

                    <h2 className="post-title" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {post.title}
                        {post.isAuthor && <span style={{ background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>YOUR POST</span>}
                    </h2>

                    <div className="post-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AvatarDisplay avatarId={post.authorAvatar} size={28} />
                        <span className="post-author">{post.authorAnonymousName}</span>
                        <span>•</span>
                        <span>{formatTime(post.createdAt)}</span>
                        {post.isEdited && <span className="edited-badge">• Edited</span>}
                    </div>

                    {post.imageUrl && (
                        <img src={post.imageUrl} alt="Post image" className="post-image" style={{ cursor: 'pointer', maxWidth: '100%', borderRadius: '8px', marginTop: '12px' }} onClick={() => setShowImageModal(true)} />
                    )}

                    {isEditing && post.canEdit ? (
                        <form onSubmit={handleSavePostEdit} style={{ marginTop: '16px' }}>
                            <textarea className="form-input form-textarea" value={editContent} onChange={(e) => setEditContent(e.target.value)} autoFocus />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                <button type="submit" className="btn btn-primary" disabled={editSubmitting}>{editSubmitting ? 'Saving...' : 'Save Changes'}</button>
                                <button type="button" className="btn btn-secondary" onClick={handleCancelPostEdit}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginTop: '16px', marginBottom: '16px' }}>{post.content}</p>
                    )}

                    <div className="post-actions">
                        <span className="action-btn">💬 {post.commentCount}</span>
                        <span className="action-btn" style={{ cursor: 'default' }}>👁️ {post.viewCount}</span>
                        <button className="action-btn" onClick={handleShare}>{copied ? '✓ Copied!' : `🔗 ${post.shareCount}`}</button>
                        <button className="action-btn" onClick={() => setShowReportModal(true)}>🚩 Report</button>
                        {post.isAuthor && post.canEdit && !isEditing && (
                            <button className="action-btn" onClick={() => setIsEditing(true)}>✏️ Edit ({Math.floor(post.editTimeRemainingSeconds / 60)}m)</button>
                        )}
                        {post.isAuthor && (
                            <button className="action-btn" onClick={handleDeletePost} style={{ color: 'var(--danger)' }}>🗑️ Delete</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Add a Comment</h3>
                <form onSubmit={handleSubmitComment}>
                    <textarea className="form-input form-textarea" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="What are your thoughts?" style={{ marginBottom: '12px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏰ Comments can be edited for 10 minutes</span>
                        <button type="submit" className="btn btn-primary" disabled={commenting || !newComment.trim()}>{commenting ? 'Posting...' : 'Comment'}</button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ marginTop: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3>Comments ({post.commentCount})</h3>
                    <div className="sort-toggle">
                        <button className={`sort-btn ${commentSort === 'top' ? 'active' : ''}`} onClick={() => setCommentSort('top')}>🔝 Top</button>
                        <button className={`sort-btn ${commentSort === 'latest' ? 'active' : ''}`} onClick={() => setCommentSort('latest')}>🕐 Latest</button>
                    </div>
                </div>

                {comments.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px' }}><p>No comments yet. Be the first to comment!</p></div>
                ) : (
                    <div className="comments-list">
                        {comments.map((comment) => (
                            <CommentCard key={comment.id} comment={comment} postId={id} onReplyAdded={fetchComments} onCommentUpdated={fetchComments} onCommentDeleted={handleCommentDeleted} />
                        ))}
                    </div>
                )}
            </div>

            {showImageModal && <ImageModal imageUrl={post.imageUrl} onClose={() => setShowImageModal(false)} />}
            <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} onSubmit={handleReport} targetType="post" />
        </div>
    );
}
