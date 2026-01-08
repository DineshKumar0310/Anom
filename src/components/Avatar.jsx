// Avatar utilities
// 20 cartoon avatar options for anonymous users

export const AVATARS = [
    { id: 'avatar_01', emoji: '🦊', color: '#ff6b6b' },
    { id: 'avatar_02', emoji: '🐼', color: '#4ecdc4' },
    { id: 'avatar_03', emoji: '🦁', color: '#ffe66d' },
    { id: 'avatar_04', emoji: '🐯', color: '#ff9f43' },
    { id: 'avatar_05', emoji: '🐺', color: '#778beb' },
    { id: 'avatar_06', emoji: '🦄', color: '#f8a5c2' },
    { id: 'avatar_07', emoji: '🐸', color: '#26de81' },
    { id: 'avatar_08', emoji: '🐵', color: '#d2b48c' },
    { id: 'avatar_09', emoji: '🦉', color: '#a55eea' },
    { id: 'avatar_10', emoji: '🐧', color: '#45aaf2' },
    { id: 'avatar_11', emoji: '🐲', color: '#20bf6b' },
    { id: 'avatar_12', emoji: '🦋', color: '#0abde3' },
    { id: 'avatar_13', emoji: '🐙', color: '#ee5a24' },
    { id: 'avatar_14', emoji: '🦈', color: '#686de0' },
    { id: 'avatar_15', emoji: '🐝', color: '#f9ca24' },
    { id: 'avatar_16', emoji: '🦅', color: '#8b4513' },
    { id: 'avatar_17', emoji: '🐢', color: '#6ab04c' },
    { id: 'avatar_18', emoji: '🦎', color: '#22a6b3' },
    { id: 'avatar_19', emoji: '🐬', color: '#74b9ff' },
    { id: 'avatar_20', emoji: '🦒', color: '#fdcb6e' },
];

export function getAvatar(avatarId) {
    return AVATARS.find(a => a.id === avatarId) || AVATARS[0];
}

export function AvatarDisplay({ avatarId, size = 40, showBorder = true }) {
    const avatar = getAvatar(avatarId);

    return (
        <div
            className="avatar-display"
            style={{
                width: size,
                height: size,
                minWidth: size,
                borderRadius: '50%',
                background: avatar.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.5,
                border: showBorder ? '2px solid var(--border)' : 'none',
            }}
        >
            {avatar.emoji}
        </div>
    );
}
