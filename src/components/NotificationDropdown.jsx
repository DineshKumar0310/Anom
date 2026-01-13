import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { AvatarDisplay } from './Avatar';

const NotificationDropdown = ({ onClose }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getNotifications(0, 50); // Fetch latest 50
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
            } catch (err) {
                console.error("Failed to mark as read", err);
            }
        }
        onClose();
        navigate(notification.link);
    };

    if (loading) return <div className="notification-dropdown loading">Loading...</div>;

    return (
        <div className="notification-dropdown">
            <div className="notification-header">
                <h3>Notifications</h3>
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="empty-notifications">No notifications yet.</div>
                ) : (
                    notifications.map(n => (
                        <div key={n.id} className={`notification-item ${!n.isRead ? 'unread' : ''}`} onClick={() => handleNotificationClick(n)}>
                            <div className="notification-avatar">
                                <AvatarDisplay avatarId={n.actorAvatar} size={32} />
                            </div>
                            <div className="notification-content">
                                <p>
                                    <strong>{n.actorAnonymousName}</strong> {n.message}
                                </p>
                                <span className="notification-time">
                                    {new Date(n.createdAt).toLocaleString()}
                                </span>
                            </div>
                            {!n.isRead && <div className="unread-dot" />}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
