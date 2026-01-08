import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AvatarDisplay } from './Avatar';
import { postService } from '../services/postService';
import ReportModal from './ReportModal';
import { useToast } from './Toast';

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
}

export default function PostCard({ post, showFullContent = false }) {
    const [copied, setCopied] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const { showToast } = useToast();

    const handleShare = async () => {
        const url = `${window.location.origin}/post/${post.id}`;
        try {
            await navigator.clipboard.writeText(url);
            await postService.share(post.id);
            setCopied(true);
            showToast('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showToast('Failed to copy link', 'error');
        }
    };

    const handleReport = async (reportData) => {
        try {
            await postService.report(post.id, reportData);
            showToast('Report submitted!');
        } catch (err) {
            showToast('Failed to submit report', 'error');
        }
    };

    return (
        <>
            <div className="card post-card-no-vote">
                <div className="post-content">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {post.tags.map(tag => (
                                <Link
                                    to={`/feed?tag=${tag}`}
                                    key={tag}
                                    className="post-category"
                                    style={{ textDecoration: 'none' }}
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    <Link to={`/post/${post.id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 className="post-title">{post.title}</h3>
                        {post.isAuthor && (
                            <span className="your-post-badge">YOUR POST</span>
                        )}
                    </Link>

                    <div className="post-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AvatarDisplay avatarId={post.authorAvatar} size={24} />
                        <span className="post-author">{post.authorAnonymousName}</span>
                        <span>•</span>
                        <span>{formatTime(post.createdAt)}</span>
                        {post.isEdited && <span className="edited-badge">• Edited</span>}
                        {post.canEdit && (
                            <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>
                                ✏️ {Math.floor(post.editTimeRemainingSeconds / 60)}m to edit
                            </span>
                        )}
                    </div>

                    {post.imageUrl && (
                        <img
                            src={post.imageUrl}
                            alt=""
                            className="post-image"
                            style={{ cursor: 'pointer' }}
                            onClick={() => window.open(post.imageUrl, '_blank')}
                        />
                    )}

                    <p className={`post-text ${showFullContent ? '' : 'truncate'}`}>
                        {post.content}
                    </p>

                    <div className="post-actions">
                        <Link to={`/post/${post.id}`} className="action-btn">
                            💬 {post.commentCount} Comments
                        </Link>
                        <span className="action-btn" style={{ cursor: 'default' }}>
                            👁️ {post.viewCount} Views
                        </span>
                        <button className="action-btn" onClick={handleShare}>
                            {copied ? '✓ Copied!' : `🔗 Share (${post.shareCount})`}
                        </button>
                        <button className="action-btn" onClick={() => setShowReportModal(true)}>
                            🚩 Report
                        </button>
                        {post.isAuthor && post.canEdit && (
                            <Link to={`/post/${post.id}?edit=true`} className="action-btn">
                                ✏️ Edit
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReport}
                targetType="post"
            />
        </>
    );
}
