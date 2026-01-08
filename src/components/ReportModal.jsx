import { useState } from 'react';

const REPORT_REASONS = [
    { value: 'SPAM', label: 'Spam' },
    { value: 'ABUSE', label: 'Abuse / Harassment' },
    { value: 'FAKE_INFORMATION', label: 'Fake Information' },
    { value: 'HARASSMENT', label: 'Bullying' },
    { value: 'OTHER', label: 'Other' },
];

export default function ReportModal({ isOpen, onClose, onSubmit, targetType }) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) return;

        setSubmitting(true);
        try {
            await onSubmit({ reason, description });
            onClose();
            setReason('');
            setDescription('');
        } catch (err) {
            console.error('Report error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Report {targetType}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Why are you reporting this?</label>
                            {REPORT_REASONS.map(r => (
                                <label
                                    key={r.value}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px',
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        background: reason === r.value ? 'var(--bg-hover)' : 'transparent'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.value}
                                        checked={reason === r.value}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                    {r.label}
                                </label>
                            ))}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Additional details (optional)</label>
                            <textarea
                                className="form-input form-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Provide more context..."
                                style={{ minHeight: '80px' }}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-danger" disabled={!reason || submitting}>
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
