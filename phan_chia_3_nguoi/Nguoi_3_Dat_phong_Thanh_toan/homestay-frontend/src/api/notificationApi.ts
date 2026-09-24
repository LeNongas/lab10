import axiosClient from './axiosClient';

export interface BookingNotification {
    id: number;
    bookingId: number;
    message: string;
    createdAt: string;
    readAt: string | null;
}

export const getNotifications = () => axiosClient.get<BookingNotification[]>('/api/notifications');
export const getUnreadCount = () => axiosClient.get<{ count: number }>('/api/notifications/unread-count');
export const markNotificationRead = (id: number) => axiosClient.put<BookingNotification>(`/api/notifications/${id}/read`);
