import React from 'react';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job }) => {
    const navigate = useNavigate();
    const isInternship = job.type === 'INTERNSHIP';
    const isClosingSoon = job.active && new Date(job.lastDate) < new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);

    // Build eligibility summary
    const eligibilitySummary = [];
    if (job.eligibleDegrees && job.eligibleDegrees.length > 0) {
        eligibilitySummary.push(job.eligibleDegrees.slice(0, 2).join('/'));
    }
    if (job.eligibleBatches) {
        eligibilitySummary.push(job.eligibleBatches);
    }
    if (job.experienceLevel) {
        eligibilitySummary.push(job.experienceLevel);
    }

    return (
        <div className="card job-card" onClick={() => navigate(`/jobs/${job.id}`)} style={{ cursor: 'pointer' }}>
            <div className="job-card-content">
                <div className="job-card-logo">
                    {job.logoUrl ? (
                        <img src={job.logoUrl} alt={job.companyName} />
                    ) : (
                        <span className="job-card-logo-fallback">{job.companyName.charAt(0).toUpperCase()}</span>
                    )}
                </div>

                <div className="job-card-info">
                    <div className="job-card-header">
                        <h3 className="job-card-title">{job.title}</h3>
                        {isClosingSoon && <span className="badge badge-danger job-closing-badge">Closing Soon</span>}
                    </div>

                    <p className="job-card-company">{job.companyName}</p>

                    <div className="job-card-badges">
                        <span className={`badge ${isInternship ? 'badge-primary' : 'badge-success'}`}>
                            {isInternship ? '🎓 Internship' : '💼 Full-Time'}
                        </span>
                        {job.location && <span className="badge badge-secondary">📍 {job.location}</span>}
                        {isInternship && job.duration && <span className="badge badge-secondary">⏱ {job.duration}</span>}
                        {eligibilitySummary.length > 0 && (
                            <span className="badge badge-secondary">🎯 {eligibilitySummary.join(' • ')}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="job-card-footer">
                <span>📅 Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                <span>⏰ Deadline: {new Date(job.lastDate).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default JobCard;
