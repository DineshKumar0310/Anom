import { useState } from 'react';
import { postService } from '../services/postService';

export default function VoteButtons({ type, id, voteCount, userVote, onUpdate }) {
    const [count, setCount] = useState(voteCount);
    const [currentVote, setCurrentVote] = useState(userVote);
    const [loading, setLoading] = useState(false);

    const handleVote = async (voteType) => {
        if (loading) return;
        setLoading(true);

        try {
            const service = type === 'post' ? postService : (await import('../services/postService')).commentService;
            const response = await service.vote(id, voteType);
            const result = response.data.data;

            let newCount = count;
            if (result.action === 'ADDED') {
                newCount = count + voteType;
                setCurrentVote(voteType);
            } else if (result.action === 'REMOVED') {
                newCount = count - currentVote;
                setCurrentVote(null);
            } else if (result.action === 'CHANGED') {
                newCount = count + (voteType * 2);
                setCurrentVote(voteType);
            }

            setCount(newCount);
            if (onUpdate) onUpdate(newCount, result.currentVote);
        } catch (error) {
            console.error('Vote error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="vote-column">
            <button
                className={`vote-btn ${currentVote === 1 ? 'upvoted' : ''}`}
                onClick={() => handleVote(1)}
                disabled={loading}
                title="Upvote"
            >
                ▲
            </button>
            <span className="vote-count">{count}</span>
            <button
                className={`vote-btn ${currentVote === -1 ? 'downvoted' : ''}`}
                onClick={() => handleVote(-1)}
                disabled={loading}
                title="Downvote"
            >
                ▼
            </button>
        </div>
    );
}
