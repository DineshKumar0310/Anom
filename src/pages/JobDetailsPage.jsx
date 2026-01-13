import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import { AvatarDisplay } from '../components/Avatar';
import api from '../services/api';

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
}

function JobCommentCard({ comment, jobId, onReplyAdded, onCommentDeleted }) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [localComment, setLocalComment] = useState(comment);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const fetchReplies = async () => {
        setLoadingReplies(true);
        try {
            const response = await api.get(`/jobs/comments/${comment.id}/replies`);
            setReplies(response.data || []);
        } catch (err) {
            console.error('Failed to load replies', err);
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
            await api.post(`/jobs/${jobId}/comments`, { content: replyContent, parentId: comment.id });
            setReplyContent('');
            setShowReplyForm(false);
            setLocalComment({ ...localComment, replyCount: localComment.replyCount + 1 });
            fetchReplies();
            setShowReplies(true);
        } catch (err) {
            alert('Failed to add reply');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editContent.trim()) return;
        setSubmitting(true);
        try {
            const response = await api.put(`/jobs/comments/${localComment.id}`, { content: editContent });
            setLocalComment(response.data);
            setIsEditing(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save edit');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/jobs/comments/${localComment.id}`);
            if (onCommentDeleted) onCommentDeleted(localComment.id);
        } catch (err) {
            alert('Failed to delete comment');
        }
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
                                <span style={{ background: 'var(--accent)', color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', marginLeft: '6px' }}>YOU</span>
                            )}
                        </span>
                        <span className="comment-time">{formatTime(localComment.createdAt)}</span>
                        {localComment.isEdited && <span className="edited-badge">Edited</span>}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSaveEdit} style={{ marginTop: '8px' }}>
                            <textarea className="form-input" value={editContent} onChange={(e) => setEditContent(e.target.value)} style={{ minHeight: '80px' }} autoFocus />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditContent(localComment.content); setIsEditing(false); }}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <p className="comment-text">{localComment.content}</p>
                    )}

                    <div className="comment-actions">
                        {!localComment.parentId && (
                            <button className="action-btn btn-sm" onClick={() => setShowReplyForm(!showReplyForm)}>💬 Reply</button>
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
                            <button className="action-btn btn-sm" onClick={handleDelete} style={{ color: 'var(--danger)' }}>🗑️ Delete</button>
                        )}
                    </div>

                    {showReplyForm && (
                        <form onSubmit={handleSubmitReply} className="reply-form">
                            <textarea className="form-input" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Write a reply..." style={{ minHeight: '60px' }} />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !replyContent.trim()}>{submitting ? 'Posting...' : 'Reply'}</button>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReplyForm(false)}>Cancel</button>
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
                            <JobCommentCard key={reply.id} comment={reply} jobId={jobId} onReplyAdded={onReplyAdded} onCommentDeleted={(id) => {
                                setReplies(replies.filter(r => r.id !== id));
                                setLocalComment({ ...localComment, replyCount: Math.max(0, localComment.replyCount - 1) });
                            }} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        fetchJob();
        fetchComments();
    }, [id]);

    const fetchJob = async () => {
        try {
            setLoading(true);
            const data = await jobService.getJobById(id);
            setJob(data);
        } catch (err) {
            console.error('Failed to fetch job details', err);
            setError('Failed to load job details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            setCommentsLoading(true);
            const response = await api.get(`/jobs/${id}/comments`);
            setComments(response.data || []);
        } catch (err) {
            console.error('Failed to fetch comments', err);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            setSubmittingComment(true);
            await api.post(`/jobs/${id}/comments`, { content: newComment });
            setNewComment('');
            fetchComments();
        } catch (err) {
            console.error('Failed to post comment', err);
            alert('Failed to post comment.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleCommentDeleted = (commentId) => {
        setComments(comments.filter(c => c.id !== commentId));
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (error) return <div className="main-content"><div className="error-message">{error}</div><button className="btn btn-primary" onClick={() => navigate('/jobs')}>Back to Jobs</button></div>;
    if (!job) return null;

    const isInternship = job.type === 'INTERNSHIP';

    return (
        <div className="main-content job-details-page">
            <button className="btn btn-ghost" onClick={() => navigate('/jobs')}>← Back to Jobs</button>

            <div className="job-details-card card">
                {/* Header */}
                <div className="job-details-header">
                    <div className="job-details-logo">
                        {job.logoUrl ? (
                            <img src={job.logoUrl} alt={job.companyName} />
                        ) : (
                            <span>{job.companyName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="job-details-title-section">
                        <h1>{job.title}</h1>
                        <p className="job-details-company">{job.companyName}</p>
                    </div>
                </div>

                {/* Badges */}
                <div className="job-details-badges">
                    <span className={`badge ${isInternship ? 'badge-primary' : 'badge-success'}`}>{isInternship ? '🎓 Internship' : '💼 Full-Time'}</span>
                    <span className="badge badge-secondary">📍 {job.location}</span>
                    {job.duration && <span className="badge badge-secondary">⏱ {job.duration}</span>}
                    {job.experienceLevel && <span className="badge badge-secondary">👤 {job.experienceLevel}</span>}
                </div>

                <hr className="job-details-divider" />

                {/* Eligibility Section */}
                <div className="job-details-eligibility">
                    <h3>🎯 Eligibility</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                        {job.eligibleDegrees && job.eligibleDegrees.length > 0 && (
                            <div style={{ marginRight: '20px' }}>
                                <strong>Degrees:</strong> {job.eligibleDegrees.join(', ')}
                            </div>
                        )}
                        {job.eligibleBranches && job.eligibleBranches.length > 0 && (
                            <div style={{ marginRight: '20px' }}>
                                <strong>Branches:</strong> {job.eligibleBranches.join(', ')}
                            </div>
                        )}
                        {job.eligibleBatches && (
                            <div style={{ marginRight: '20px' }}>
                                <strong>Batches:</strong> {job.eligibleBatches}
                            </div>
                        )}
                    </div>
                    {job.eligibility && <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{job.eligibility}</p>}
                </div>

                <hr className="job-details-divider" />

                {/* Description */}
                <div className="job-details-description">
                    <h3>About The Role</h3>
                    <p>{job.description}</p>
                </div>

                {/* Footer */}
                <div className="job-details-footer">
                    <div className="job-details-dates">
                        <p>📅 Posted: {new Date(job.postedDate).toLocaleDateString()}</p>
                        <p>⏰ Deadline: {new Date(job.lastDate).toLocaleDateString()}</p>
                    </div>
                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">Apply Now ↗</a>
                </div>
            </div>

            {/* Comment Section */}
            <div className="job-comments-section card">
                <h3>💬 Discussions ({comments.length})</h3>

                <form onSubmit={handleSubmitComment} className="job-comment-form">
                    <textarea
                        placeholder="Ask a question or share your thoughts about this job..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="form-input form-textarea"
                        rows="3"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏰ Comments can be edited for 5 minutes</span>
                        <button type="submit" className="btn btn-primary" disabled={submittingComment || !newComment.trim()}>
                            {submittingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>

                <div className="job-comments-list">
                    {commentsLoading ? (
                        <p style={{ color: 'var(--text-muted)' }}>Loading comments...</p>
                    ) : comments.length === 0 ? (
                        <div className="empty-state" style={{ padding: '20px 0' }}>
                            <p>No comments yet. Be the first to start a discussion!</p>
                        </div>
                    ) : (
                        comments.map(comment => (
                            <JobCommentCard key={comment.id} comment={comment} jobId={id} onReplyAdded={fetchComments} onCommentDeleted={handleCommentDeleted} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetailsPage;
