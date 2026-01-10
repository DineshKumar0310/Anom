import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Comment state
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
            // It's okay if comments fail, not a blocking error
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
            fetchComments(); // Refresh
        } catch (err) {
            console.error('Failed to post comment', err);
            alert('Failed to post comment.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/jobs/comments/${commentId}`);
            fetchComments();
        } catch (err) {
            console.error('Failed to delete comment', err);
        }
    }

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (error) return <div className="main-content"><div className="error-message">{error}</div><button className="btn btn-primary" onClick={() => navigate('/jobs')}>Back to Jobs</button></div>;
    if (!job) return null;

    const isInternship = job.type === 'INTERNSHIP';

    return (
        <div className="main-content job-details-page">
            <button className="btn btn-ghost" onClick={() => navigate('/jobs')}>
                ← Back to Jobs
            </button>

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
                    <span className={`badge ${isInternship ? 'badge-primary' : 'badge-success'}`}>
                        {isInternship ? '🎓 Internship' : '💼 Full-Time'}
                    </span>
                    <span className="badge badge-secondary">📍 {job.location}</span>
                    {job.duration && <span className="badge badge-secondary">⏱ {job.duration}</span>}
                    <span className="badge badge-secondary">🎯 {job.eligibility}</span>
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
                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
                        Apply Now ↗
                    </a>
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
                    <button type="submit" className="btn btn-primary" disabled={submittingComment || !newComment.trim()}>
                        {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
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
                            <div key={comment.id} className="job-comment-item">
                                <div className="job-comment-header">
                                    <span className="job-comment-author">{comment.authorAnonymousName || 'Anonymous'}</span>
                                    <span className="job-comment-time">{new Date(comment.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="job-comment-content">{comment.content}</p>
                                {user && (user.id === comment.authorId || user.role === 'ADMIN') && (
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteComment(comment.id)}>
                                        🗑️ Delete
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetailsPage;
