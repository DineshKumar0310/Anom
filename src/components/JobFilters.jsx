import React, { useState } from 'react';

const JobFilters = ({ onFilterChange }) => {
    const [search, setSearch] = useState('');
    const [type, setType] = useState('ALL');

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        onFilterChange({ search: e.target.value, type });
    };

    const handleTypeChange = (newType) => {
        setType(newType);
        onFilterChange({ search, type: newType });
    };

    return (
        <div className="job-filters-container">
            <div className="job-filters-search">
                <span className="job-filters-search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search by company or role..."
                    value={search}
                    onChange={handleSearchChange}
                    className="form-input"
                />
            </div>

            <div className="job-filters-tabs">
                <button
                    className={`job-filter-tab ${type === 'ALL' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('ALL')}
                >
                    All
                </button>
                <button
                    className={`job-filter-tab ${type === 'JOB' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('JOB')}
                >
                    💼 Jobs
                </button>
                <button
                    className={`job-filter-tab ${type === 'INTERNSHIP' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('INTERNSHIP')}
                >
                    🎓 Internships
                </button>
            </div>
        </div>
    );
};

export default JobFilters;
