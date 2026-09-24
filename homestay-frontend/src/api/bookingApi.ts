import axiosClient from './axiosClient';
import type {
    Booking,
    BookingRequest,
    PaymentMethod,
    PaymentStatus,
} from '../types/booking';

// Đặt phòng
export function bookRoom(data: BookingRequest) {
    return axiosClient.post<Booking>(
        '/api/bookings',
        data
    );
}

// Lấy danh sách phòng của khách hàng đang đăng nhập
export function getMyBookings() {
    return axiosClient.get<Booking[]>(
        '/api/bookings/my'
    );
}

export function getAllBookings() {
    return axiosClient.get<Booking[]>('/api/bookings/admin');
}

export function getPaymentOptions() {
    return axiosClient.get<{ bankTransferAvailable: boolean; depositPercent: number }>('/api/bookings/payment-options');
}

export function choosePaymentMethod(id: number, method: PaymentMethod) {
    return axiosClient.put<Booking>(`/api/bookings/${id}/payment-method`, { method });
}

export function confirmBooking(id: number) {
    return axiosClient.put<Booking>(`/api/bookings/admin/${id}/confirm`);
}

export function rejectBooking(id: number, reason: string) {
    return axiosClient.put<Booking>(`/api/bookings/admin/${id}/reject`, { reason });
}

export function cancelBookingByAdmin(id: number, reason: string) {
    return axiosClient.put<Booking>(`/api/bookings/admin/${id}/cancel`, { reason });
}

export function updateBookingPayment(id: number, status: PaymentStatus) {
    return axiosClient.put<Booking>(`/api/bookings/admin/${id}/payment`, { status });
}

// Hủy đặt phòng
export function cancelBooking(id: number) {
    return axiosClient.delete(
        `/api/bookings/${id}`
    );
}
