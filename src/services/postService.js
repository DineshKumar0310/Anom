import api from './api';

export const postService = {
    getPosts: (params = {}) => api.get('/posts', { params }),
    getTrending: (params = {}) => api.get('/posts/trending', { params }),
    searchPosts: (query, params = {}) => api.get('/posts/search', { params: { q: query, ...params } }),
    getPost: (id) => api.get(`/posts/${id}`),
    createPost: (formData) => api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    editPost: (id, data) => api.put(`/posts/${id}`, data),
    deletePost: (id) => api.delete(`/posts/${id}`),
    getMyPosts: (params = {}) => api.get('/posts/my-posts', { params }),
    share: (id) => api.post(`/posts/${id}/share`),
    report: (id, data) => api.post(`/posts/${id}/report`, data),
};

export const commentService = {
    getComments: (postId, params = {}) => api.get(`/posts/${postId}/comments`, { params }),
    getReplies: (commentId) => api.get(`/comments/${commentId}/replies`),
    createComment: (postId, content, parentId = null) => api.post(`/posts/${postId}/comments`, { content, parentId }),
    editComment: (id, content) => api.put(`/comments/${id}`, { content }),
    deleteComment: (id) => api.delete(`/comments/${id}`),
    vote: (id, voteType) => api.post(`/comments/${id}/vote`, { voteType }),
    removeVote: (id) => api.delete(`/comments/${id}/vote`),
    report: (id, data) => api.post(`/comments/${id}/report`, data),
};

export const adminService = {
    getStats: () => api.get('/admin/stats'),
    getReports: (params = {}) => api.get('/admin/reports', { params }),
    resolveReport: (id, status, notes) => api.put(`/admin/reports/${id}/resolve`, null, { params: { status, notes } }),
    getUsers: (params = {}) => api.get('/admin/users', { params }),
    getUserDetails: (id) => api.get(`/admin/users/${id}`),
    removePost: (id) => api.delete(`/admin/posts/${id}`),
    removeComment: (id) => api.delete(`/admin/comments/${id}`),
    banUser: (id, reason, durationDays) => api.post(`/admin/users/${id}/ban`, null, { params: { reason, durationDays } }),
    unbanUser: (id) => api.post(`/admin/users/${id}/unban`),
    updateUserType: (id, userType) => api.put(`/admin/users/${id}/type`, null, { params: { userType } }),
};
