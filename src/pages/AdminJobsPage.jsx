import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';

const AdminJobsPage = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingJob, setEditingJob] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '', title: '', type: 'JOB', duration: '', location: '', eligibility: '',
        lastDate: '', description: '', applyLink: '', logoUrl: '', isActive: true
    });

    useEffect(() => { fetchJobs(); }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await jobService.getAllJobsForAdmin();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching admin jobs:', error);
            alert('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                await jobService.deleteJob(id);
                fetchJobs();
            } catch (error) {
                console.error('Error deleting job:', error);
                alert('Failed to delete job');
            }
        }
    };

    const handleEdit = (job) => {
        setEditingJob(job);
        setFormData({
            companyName: job.companyName, title: job.title, type: job.type, duration: job.duration || '',
            location: job.location, eligibility: job.eligibility,
            lastDate: job.lastDate ? job.lastDate.substring(0, 10) : '', description: job.description,
            applyLink: job.applyLink, logoUrl: job.logoUrl || '', isActive: job.isActive
        });
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingJob(null);
        setFormData({
            companyName: '', title: '', type: 'JOB', duration: '', location: '', eligibility: '',
            lastDate: '', description: '', applyLink: '', logoUrl: '', isActive: true
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, lastDate: formData.lastDate ? new Date(formData.lastDate).toISOString() : null };
            if (editingJob) { await jobService.updateJob(editingJob.id, payload); }
            else { await jobService.createJob(payload); }
            setShowForm(false);
            fetchJobs();
        } catch (error) {
            console.error('Error saving job:', error);
            alert('Failed to save job');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div className="main-content admin-jobs-page">
            <div className="admin-jobs-header">
                <button className="btn btn-ghost" onClick={() => navigate('/admin')}>← Back to Admin</button>
                <h1>Manage Jobs & Internships</h1>
                {!showForm && <button className="btn btn-primary" onClick={handleAddNew}>+ Add New Job</button>}
            </div>

            {showForm ? (
                <div className="card admin-job-form-card">
                    <h2>{editingJob ? '✏️ Edit Job' : '➕ Create New Job'}</h2>
                    <form onSubmit={handleSubmit} className="admin-job-form">
                        <div className="form-row">
                            <div className="form-group"><label>Job Title</label><input name="title" className="form-input" value={formData.title} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Company Name</label><input name="companyName" className="form-input" value={formData.companyName} onChange={handleChange} required /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Type</label><select name="type" className="form-input form-select" value={formData.type} onChange={handleChange}><option value="JOB">Job</option><option value="INTERNSHIP">Internship</option></select></div>
                            <div className="form-group"><label>Duration (if internship)</label><input name="duration" className="form-input" placeholder="e.g., 6 months" value={formData.duration} onChange={handleChange} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Location</label><input name="location" className="form-input" placeholder="e.g., Remote, Hybrid - Bangalore" value={formData.location} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Eligibility</label><input name="eligibility" className="form-input" placeholder="e.g., 2024-2026 batch" value={formData.eligibility} onChange={handleChange} required /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Logo URL</label><input name="logoUrl" className="form-input" placeholder="https://..." value={formData.logoUrl} onChange={handleChange} /></div>
                            <div className="form-group"><label>Application Deadline</label><input type="date" name="lastDate" className="form-input" value={formData.lastDate} onChange={handleChange} required /></div>
                        </div>
                        <div className="form-group"><label>Apply Link</label><input name="applyLink" className="form-input" placeholder="https://..." value={formData.applyLink} onChange={handleChange} required /></div>
                        <div className="form-group"><label>Description</label><textarea name="description" className="form-input form-textarea" rows="6" value={formData.description} onChange={handleChange} required></textarea></div>
                        <div className="form-check-inline"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="activeCheck" /><label htmlFor="activeCheck">Mark as Active</label></div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">💾 Save Job</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="admin-jobs-list">
                    {jobs.length === 0 ? (
                        <div className="empty-state"><h3>No jobs created yet.</h3></div>
                    ) : (
                        jobs.map(job => (
                            <div key={job.id} className="card admin-job-item">
                                <div className="admin-job-item-info">
                                    <h3>{job.title}</h3>
                                    <p>{job.companyName} • <span className={`badge ${job.type === 'INTERNSHIP' ? 'badge-primary' : 'badge-success'}`}>{job.type}</span></p>
                                    <p className="admin-job-meta">Posted: {new Date(job.postedDate).toLocaleDateString()} | Deadline: {new Date(job.lastDate).toLocaleDateString()}</p>
                                </div>
                                <div className="admin-job-item-status">
                                    <span className={`badge ${job.isActive ? 'badge-success' : 'badge-danger'}`}>{job.isActive ? 'Active' : 'Closed'}</span>
                                </div>
                                <div className="admin-job-item-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(job)}>✏️ Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job.id)}>🗑️ Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminJobsPage;
