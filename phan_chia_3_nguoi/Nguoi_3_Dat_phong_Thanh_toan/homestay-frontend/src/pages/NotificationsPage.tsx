import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead } from '../api/notificationApi';
import type { BookingNotification } from '../api/notificationApi';

function errorText(error: unknown) {
    if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
        return error.response.data.message as string;
    }
    return 'Không thể tải thông báo. Vui lòng thử lại.';
}

export default function NotificationsPage() {
    const [items, setItems] = useState<BookingNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems((await getNotifications()).data);
            setError('');
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const markRead = async (id: number) => {
        setActionId(id);
        try {
            const { data } = await markNotificationRead(id);
            setItems((current) => current.map((item) => item.id === id ? data : item));
            window.dispatchEvent(new Event('homestay-notifications-updated'));
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setActionId(null);
        }
    };

    return <section>
        <span className="eyebrow">KỲ NGHỈ CỦA BẠN</span>
        <h1>Thông báo</h1>
        <button type="button" onClick={() => void load()} disabled={loading}>Tải lại</button>
        {loading && <p>Đang tải thông báo...</p>}
        {error && <p className="message error" role="alert">{error}</p>}
        {!loading && items.length === 0 && <p>Bạn chưa có thông báo nào.</p>}
        <div className="booking-list">
            {items.map((item) => <article className={`card notification-card ${item.readAt ? '' : 'notification-unread'}`} key={item.id}>
                <div className="notification-main">
                    <p>{item.message}</p>
                    <small>{new Date(item.createdAt).toLocaleString('vi-VN')}</small>
                </div>
                <div className="room-actions">
                    <Link to="/my-bookings">Xem đơn #{item.bookingId}</Link>
                    {!item.readAt && <button type="button" disabled={actionId === item.id}
                        onClick={() => void markRead(item.id)}>Đã đọc</button>}
                </div>
            </article>)}
        </div>
    </section>;
}
