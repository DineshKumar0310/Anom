import React, { useState, useEffect } from 'react';
import { jobService } from '../services/jobService';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';

const JobPage = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await jobService.getAllJobs();
            setJobs(data);
            setFilteredJobs(data);
        } catch (err) {
            console.error('Failed to fetch jobs', err);
            setError('Failed to load jobs. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = ({ search, type }) => {
        let result = jobs;

        if (type !== 'ALL') {
            result = result.filter(job => job.type === type);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(job =>
                job.companyName.toLowerCase().includes(searchLower) ||
                job.title.toLowerCase().includes(searchLower)
            );
        }

        setFilteredJobs(result);
    };

    if (loading) return <div className="loading"><div className="spinner"></div><p>Loading opportunities...</p></div>;
    if (error) return <div className="main-content"><div className="error-message">{error}</div></div>;

    return (
        <div className="main-content">
            <div className="jobs-page-header">
                <h1>💼 Jobs & Internships</h1>
                <p>Explore the latest career opportunities curated for you.</p>
            </div>

            <JobFilters onFilterChange={handleFilterChange} />

            <div className="jobs-list">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>No Jobs Found</h3>
                        <p>Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobPage;
