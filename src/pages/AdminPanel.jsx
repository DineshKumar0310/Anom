import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService, postService, commentService } from '../services/postService';
import { useToast } from '../components/Toast';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('reports');
    const [reports, setReports] = useState([]);
    const [groupedReports, setGroupedReports] = useState({});
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [expandedPost, setExpandedPost] = useState(null);
    const [postComments, setPostComments] = useState({});
    const { showToast } = useToast();

    const fetchStats = useCallback(async () => {
        try {
            const response = await adminService.getStats();
            setStats(response.data.data);
        } catch (err) {
            showToast('Failed to load stats', 'error');
        }
    }, [showToast]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchReports();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'content') {
            fetchPosts();
        }
    }, [activeTab]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await adminService.getReports({ status: 'PENDING' });
            const allReports = response.data.data.content || [];
            setReports(allReports);

            // Group reports by targetType and targetId
            const grouped = {};
            allReports.forEach(report => {
                const key = `${report.targetType}-${report.targetId}`;
                if (!grouped[key]) {
                    grouped[key] = {
                        targetType: report.targetType,
                        targetId: report.targetId,
                        contentSnapshot: report.contentSnapshot,
                        authorAnonymousName: report.authorAnonymousName,
                        reports: []
                    };
                }
                grouped[key].reports.push(report);
            });
            setGroupedReports(grouped);
        } catch (err) {
            showToast('Failed to load reports', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminService.getUsers();
            setUsers(response.data.data.content || []);
        } catch (err) {
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await postService.getPosts({ size: 50 });
            setPosts(response.data.data.content || []);
        } catch (err) {
            showToast('Failed to load posts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPostComments = async (postId) => {
        try {
            const response = await commentService.getComments(postId, { size: 100 });
            setPostComments(prev => ({ ...prev, [postId]: response.data.data.content || [] }));
        } catch (err) {
            showToast('Failed to load comments', 'error');
        }
    };

    const handleExpandPost = (postId) => {
        if (expandedPost === postId) {
            setExpandedPost(null);
        } else {
            setExpandedPost(postId);
            if (!postComments[postId]) {
                fetchPostComments(postId);
            }
        }
    };

    const handleResolveAllReports = async (targetType, targetId, action) => {
        const key = `${targetType}-${targetId}`;
        const group = groupedReports[key];
        if (!group) return;

        try {
            // Resolve all reports for this target
            for (const report of group.reports) {
                await adminService.resolveReport(report.id, action === 'delete' ? 'RESOLVED' : 'DISMISSED', 'Bulk action by admin');
            }

            if (action === 'delete') {
                if (targetType === 'POST') {
                    await adminService.removePost(targetId);
                    showToast('Post deleted and all reports resolved!');
                } else {
                    await adminService.removeComment(targetId);
                    showToast('Comment deleted and all reports resolved!');
                }
            } else {
                showToast(`All ${group.reports.length} reports dismissed!`);
            }

            // Refresh both reports and stats
            await Promise.all([fetchReports(), fetchStats()]);
        } catch (err) {
            showToast('Failed to process reports', 'error');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm('Delete this post and all its comments?')) return;
        try {
            await adminService.removePost(postId);
            showToast('Post deleted successfully!');
            // Clear cached comments for this post
            setPostComments(prev => {
                const copy = { ...prev };
                delete copy[postId];
                return copy;
            });
            // Refresh posts and stats together
            await Promise.all([fetchPosts(), fetchStats()]);
        } catch (err) {
            showToast('Failed to delete post', 'error');
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!confirm('Delete this comment?')) return;
        try {
            await adminService.removeComment(commentId);
            showToast('Comment deleted successfully!');
            // Refetch comments for this post to get accurate list
            await fetchPostComments(postId);
            // Also refresh posts to update comment count and stats
            await Promise.all([fetchPosts(), fetchStats()]);
        } catch (err) {
            showToast('Failed to delete comment', 'error');
        }
    };

    const handleToggleUserType = async (userId, currentType) => {
        const newType = currentType === 'FREE' ? 'PREMIUM' : 'FREE';
        try {
            await adminService.updateUserType(userId, newType);
            showToast(newType === 'PREMIUM' ? 'User upgraded to Premium!' : 'User downgraded to Free!');
            await Promise.all([fetchUsers(), fetchStats()]);
        } catch (err) {
            showToast('Failed to update user', 'error');
        }
    };

    const handleBanUser = async (userId) => {
        const reason = prompt('Ban reason:');
        if (!reason) return;
        try {
            await adminService.banUser(userId, reason, null);
            showToast('User banned successfully!');
            await Promise.all([fetchUsers(), fetchStats()]);
        } catch (err) {
            showToast('Failed to ban user', 'error');
        }
    };

    const handleUnbanUser = async (userId) => {
        try {
            await adminService.unbanUser(userId);
            showToast('User unbanned successfully!');
            await Promise.all([fetchUsers(), fetchStats()]);
        } catch (err) {
            showToast('Failed to unban user', 'error');
        }
    };

    return (
        <div className="main-content">
            <h1 style={{ marginBottom: '20px' }}>⚙️ Admin Dashboard</h1>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
                    <div style={{ fontSize: '1.2rem' }}>👥</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{stats.totalUsers || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Users</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
                    <div style={{ fontSize: '1.2rem' }}>📝</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{stats.totalPosts || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Posts</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
                    <div style={{ fontSize: '1.2rem' }}>💬</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{stats.totalComments || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Comments</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
                    <div style={{ fontSize: '1.2rem' }}>🚩</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: stats.pendingReports > 0 ? 'var(--danger)' : 'inherit' }}>
                        {stats.pendingReports || 0}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Reports</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="sort-toggle" style={{ marginBottom: '20px' }}>
                <button className={`sort-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                    🚩 Reports
                </button>
                <button className={`sort-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
                    📝 Posts & Comments
                </button>
                <button className={`sort-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                    👥 Users
                </button>
            </div>

            {loading ? (
                <div className="loading"><div className="spinner"></div><p>Loading...</p></div>
            ) : activeTab === 'reports' ? (
                /* GROUPED REPORTS */
                <div>
                    {Object.keys(groupedReports).length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">✅</div>
                            <h3>No pending reports</h3>
                        </div>
                    ) : (
                        Object.values(groupedReports).map(group => (
                            <div key={`${group.targetType}-${group.targetId}`} className="card" style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                            background: group.targetType === 'POST' ? 'var(--accent)' : 'var(--warning)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }}>
                                            {group.targetType}
                                        </span>
                                        <span style={{
                                            background: 'var(--danger)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }}>
                                            {group.reports.length} {group.reports.length === 1 ? 'Report' : 'Reports'}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        By: {group.authorAnonymousName}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                        {group.contentSnapshot && group.contentSnapshot.length > 300 ? group.contentSnapshot.slice(0, 300) + '...' : group.contentSnapshot}
                                    </div>
                                </div>

                                {/* Individual reports */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                        Report Reasons:
                                    </div>
                                    {group.reports.map((report, idx) => (
                                        <div key={report.id} style={{
                                            fontSize: '0.85rem',
                                            color: 'var(--text-muted)',
                                            padding: '6px 10px',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: '4px',
                                            marginBottom: '4px'
                                        }}>
                                            {idx + 1}. <strong>{report.reason && report.reason.replace(/_/g, ' ')}</strong>
                                            {report.description && <span> — "{report.description}"</span>}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleResolveAllReports(group.targetType, group.targetId, 'delete')}
                                    >
                                        🗑️ Delete {group.targetType === 'POST' ? 'Post' : 'Comment'} & Resolve All
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleResolveAllReports(group.targetType, group.targetId, 'dismiss')}
                                    >
                                        ❌ Dismiss All ({group.reports.length})
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : activeTab === 'content' ? (
                /* POSTS & COMMENTS VIEW */
                <div>
                    {posts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <h3>No posts</h3>
                        </div>
                    ) : posts.map(post => (
                        <div key={post.id} className="card" style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                    <Link to={`/post/${post.id}`} style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {post.title}
                                    </Link>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        By {post.authorAnonymousName} • {post.commentCount} comments • {post.viewCount} views
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleExpandPost(post.id)}
                                    >
                                        {expandedPost === post.id ? '▼ Hide' : '▶ Comments'}
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeletePost(post.id)}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>

                            {/* Expanded comments */}
                            {expandedPost === post.id && (
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                    {!postComments[post.id] ? (
                                        <div style={{ color: 'var(--text-muted)' }}>Loading comments...</div>
                                    ) : postComments[post.id].length === 0 ? (
                                        <div style={{ color: 'var(--text-muted)' }}>No comments</div>
                                    ) : (
                                        postComments[post.id].map(comment => (
                                            <div key={comment.id} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '8px 12px',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '6px',
                                                marginBottom: '6px'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {comment.authorAnonymousName}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                        {comment.content && comment.content.length > 100 ? comment.content.slice(0, 100) + '...' : comment.content}
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                /* USERS */
                <div>
                    {users.map(user => (
                        <div key={user.id} className="card" style={{ marginBottom: '12px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {user.anonymousName}
                                        {user.isPremium && <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>PREMIUM</span>}
                                        {user.isBanned && <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>BANNED</span>}
                                        {user.role === 'ADMIN' && <span style={{ background: 'var(--accent)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>ADMIN</span>}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📧 {user.email}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-sm"
                                        style={{ background: user.isPremium ? 'var(--text-muted)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}
                                        onClick={() => handleToggleUserType(user.id, user.userType)}
                                    >
                                        {user.isPremium ? '⬇️ Downgrade' : '⬆️ Upgrade'}
                                    </button>
                                    {user.isBanned ? (
                                        <button className="btn btn-primary btn-sm" onClick={() => handleUnbanUser(user.id)}>✅ Unban</button>
                                    ) : (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleBanUser(user.id)} disabled={user.role === 'ADMIN'}>🚫 Ban</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
