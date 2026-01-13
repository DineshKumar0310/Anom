import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';

const DEGREE_OPTIONS = ['B.E.', 'B.Tech', 'BCS', 'BCA', 'MCA', 'M.Tech', 'MBA', 'B.Sc', 'M.Sc', 'Any'];
const BRANCH_OPTIONS = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Any'];

const AdminJobsPage = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingJob, setEditingJob] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '', title: '', type: 'JOB', duration: '', location: '',
        eligibleDegrees: [], eligibleBranches: [], eligibleBatches: '', experienceLevel: 'Fresher',
        eligibility: '', lastDate: '', description: '', applyLink: '', logoUrl: '', active: true
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
            location: job.location,
            eligibleDegrees: job.eligibleDegrees || [],
            eligibleBranches: job.eligibleBranches || [],
            eligibleBatches: job.eligibleBatches || '',
            experienceLevel: job.experienceLevel || 'Fresher',
            eligibility: job.eligibility || '',
            lastDate: job.lastDate ? job.lastDate.substring(0, 10) : '', description: job.description,
            applyLink: job.applyLink, logoUrl: job.logoUrl || '', active: job.active
        });
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingJob(null);
        setFormData({
            companyName: '', title: '', type: 'JOB', duration: '', location: '',
            eligibleDegrees: [], eligibleBranches: [], eligibleBatches: '', experienceLevel: 'Fresher',
            eligibility: '', lastDate: '', description: '', applyLink: '', logoUrl: '', active: true
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

    const handleMultiSelect = (name, value) => {
        setFormData(prev => {
            const current = prev[name] || [];
            if (current.includes(value)) {
                return { ...prev, [name]: current.filter(v => v !== value) };
            } else {
                return { ...prev, [name]: [...current, value] };
            }
        });
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
                            <div className="form-group">
                                <label>Experience Level</label>
                                <select name="experienceLevel" className="form-input form-select" value={formData.experienceLevel} onChange={handleChange}>
                                    <option value="Fresher">Fresher</option>
                                    <option value="0-1 years">0-1 years</option>
                                    <option value="1-3 years">1-3 years</option>
                                    <option value="3-5 years">3-5 years</option>
                                    <option value="5+ years">5+ years</option>
                                </select>
                            </div>
                        </div>

                        {/* Eligibility Section */}
                        <div className="form-group">
                            <label>Eligible Degrees (click to toggle)</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                {DEGREE_OPTIONS.map(deg => (
                                    <button key={deg} type="button" onClick={() => handleMultiSelect('eligibleDegrees', deg)}
                                        className={`btn btn-sm ${formData.eligibleDegrees.includes(deg) ? 'btn-primary' : 'btn-secondary'}`}>
                                        {deg}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Eligible Branches (click to toggle)</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                {BRANCH_OPTIONS.map(br => (
                                    <button key={br} type="button" onClick={() => handleMultiSelect('eligibleBranches', br)}
                                        className={`btn btn-sm ${formData.eligibleBranches.includes(br) ? 'btn-primary' : 'btn-secondary'}`}>
                                        {br}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Eligible Batches</label><input name="eligibleBatches" className="form-input" placeholder="e.g., 2024-2026" value={formData.eligibleBatches} onChange={handleChange} /></div>
                            <div className="form-group"><label>Additional Eligibility Notes</label><input name="eligibility" className="form-input" placeholder="Any other criteria..." value={formData.eligibility} onChange={handleChange} /></div>
                        </div>

                        <div className="form-row">
                            <div className="form-group"><label>Logo URL</label><input name="logoUrl" className="form-input" placeholder="https://..." value={formData.logoUrl} onChange={handleChange} /></div>
                            <div className="form-group"><label>Application Deadline</label><input type="date" name="lastDate" className="form-input" value={formData.lastDate} onChange={handleChange} required /></div>
                        </div>
                        <div className="form-group"><label>Apply Link</label><input name="applyLink" className="form-input" placeholder="https://..." value={formData.applyLink} onChange={handleChange} required /></div>
                        <div className="form-group"><label>Description</label><textarea name="description" className="form-input form-textarea" rows="6" value={formData.description} onChange={handleChange} required></textarea></div>
                        <div className="form-check-inline"><input type="checkbox" name="active" checked={formData.active} onChange={handleChange} id="activeCheck" /><label htmlFor="activeCheck">Mark as Active</label></div>
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
                                    <span className={`badge ${job.active ? 'badge-success' : 'badge-danger'}`}>{job.active ? 'Active' : 'Closed'}</span>
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
