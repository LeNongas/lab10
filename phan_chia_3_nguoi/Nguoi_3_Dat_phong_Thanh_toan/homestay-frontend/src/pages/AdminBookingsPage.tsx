import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { cancelBookingByAdmin, confirmBooking, getAllBookings, rejectBooking, updateBookingPayment } from '../api/bookingApi';
import type { Booking, PaymentStatus } from '../types/booking';

const money = new Intl.NumberFormat('vi-VN');
const bookingStatus = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', CANCELLED: 'Đã hủy', REJECTED: 'Đã từ chối' };
const paymentStatus = { UNPAID: 'Chưa thanh toán', DEPOSIT_PAID: 'Đã nhận cọc', PAID: 'Đã thanh toán', REFUND_PENDING: 'Chờ hoàn tiền', REFUNDED: 'Đã hoàn tiền' };
const paymentMethod = { BANK_TRANSFER_DEPOSIT: 'Chuyển khoản đặt cọc', PAY_AT_CHECKIN: 'Thanh toán khi nhận phòng' };

function errorText(error: unknown) {
    if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
        return error.response.data.message as string;
    }
    return 'Không thể xử lý yêu cầu. Vui lòng thử lại.';
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState<number | null>(null);
    const [paymentChoices, setPaymentChoices] = useState<Record<number, PaymentStatus>>({});
    const [decision, setDecision] = useState<{ id: number; kind: 'reject' | 'cancel' } | null>(null);
    const [reason, setReason] = useState('');

    const loadBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setBookings((await getAllBookings()).data);
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void loadBookings(); }, [loadBookings]);

    const confirm = async (booking: Booking) => {
        setActionId(booking.id);
        setError('');
        try {
            await confirmBooking(booking.id);
            await loadBookings();
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setActionId(null);
        }
    };

    const savePayment = async (booking: Booking) => {
        setActionId(booking.id);
        setError('');
        try {
            await updateBookingPayment(booking.id, booking.paymentStatus === 'REFUND_PENDING'
                ? 'REFUNDED' : paymentChoices[booking.id] ?? booking.paymentStatus);
            await loadBookings();
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setActionId(null);
        }
    };

    const submitDecision = async (event: FormEvent) => {
        event.preventDefault();
        if (!decision || !reason.trim()) { setError('Vui lòng nhập lý do.'); return; }
        setActionId(decision.id);
        setError('');
        try {
            if (decision.kind === 'reject') await rejectBooking(decision.id, reason.trim());
            else await cancelBookingByAdmin(decision.id, reason.trim());
            setDecision(null);
            setReason('');
            await loadBookings();
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setActionId(null);
        }
    };

    return <section>
        <span className="eyebrow">DÀNH CHO QUẢN TRỊ VIÊN</span>
        <h1>Danh sách đặt phòng</h1>
        <button type="button" onClick={() => void loadBookings()} disabled={loading}>Tải lại</button>
        {loading && <p>Đang tải...</p>}
        {error && <div className="message error" role="alert">{error}</div>}
        {!loading && bookings.length === 0 && <p>Chưa có ai đặt phòng.</p>}
        <div className="booking-list">
            {bookings.map((booking) => <article className="card" key={booking.id}>
                <div className="booking-heading">
                    <h2>{booking.roomName}</h2>
                    <strong>{bookingStatus[booking.status]}</strong>
                </div>
                <p>Người đặt: <strong>{booking.customerName}</strong> · Ngày gửi: {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
                <p>Liên hệ: <strong>{booking.guestFullName || 'Chưa có thông tin'}</strong>
                    {booking.guestPhone && <> · <a href={`tel:${booking.guestPhone}`}>{booking.guestPhone}</a></>}</p>
                {booking.checkInNote && <p>Ghi chú nhận phòng: {booking.checkInNote}</p>}
                <p>Nhận phòng: {booking.checkIn} · Trả phòng: {booking.checkOut} · {booking.guests} khách</p>
                <p>Tổng tiền: <strong>{booking.totalPrice == null ? 'Chưa có dữ liệu' : `${money.format(booking.totalPrice)} đ`}</strong></p>
                <p>Cách thanh toán: {booking.paymentMethod ? paymentMethod[booking.paymentMethod] : 'Khách chưa chọn'}</p>
                {booking.paymentMethod === 'BANK_TRANSFER_DEPOSIT' && <p>Tiền cọc: <strong>{booking.depositAmount == null ? 'Chưa có dữ liệu' : `${money.format(booking.depositAmount)} đ`}</strong>
                    {' · '}Mã đối chiếu: <strong>{booking.transferReference || `NEST${booking.id}`}</strong></p>}
                <p>Trạng thái thanh toán: {paymentStatus[booking.paymentStatus]}</p>
                {booking.statusReason && <p className="booking-reason"><strong>Lý do {booking.status === 'REJECTED' ? 'từ chối' : 'hủy'}:</strong> {booking.statusReason}</p>}
                {booking.status === 'PENDING' && <button type="button"
                    onClick={() => void confirm(booking)} disabled={!booking.paymentMethod || actionId === booking.id}>
                    Xác nhận đặt phòng
                </button>}
                {booking.status === 'PENDING' && <button type="button" className="danger"
                    onClick={() => { setDecision({ id: booking.id, kind: 'reject' }); setReason(''); setError(''); }}
                    disabled={actionId === booking.id}>Từ chối đơn</button>}
                {booking.status === 'CONFIRMED' && <button type="button" className="danger"
                    onClick={() => { setDecision({ id: booking.id, kind: 'cancel' }); setReason(''); setError(''); }}
                    disabled={actionId === booking.id}>Hủy đơn</button>}
                {decision?.id === booking.id && <form className="decision-form" onSubmit={(event) => void submitDecision(event)}>
                    <label htmlFor={`decision-reason-${booking.id}`}>Lý do {decision.kind === 'reject' ? 'từ chối' : 'hủy'} đơn</label>
                    <textarea id={`decision-reason-${booking.id}`} value={reason} maxLength={500} required
                        onChange={(event) => setReason(event.target.value)} placeholder="Lý do sẽ hiển thị cho khách hàng" />
                    <div className="room-actions">
                        <button type="submit" className="danger" disabled={actionId === booking.id}>
                            {decision.kind === 'reject' ? 'Xác nhận từ chối' : 'Xác nhận hủy đơn'}
                        </button>
                        <button type="button" onClick={() => { setDecision(null); setReason(''); }}>Bỏ qua</button>
                    </div>
                </form>}
                {booking.paymentStatus === 'REFUND_PENDING' && <div className="payment-choice">
                    <span>Đã hoàn tiền cho khách?</span>
                    <button type="button" onClick={() => void savePayment(booking)} disabled={actionId === booking.id}>Đánh dấu đã hoàn tiền</button>
                </div>}
                {booking.paymentMethod && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && <div className="payment-choice">
                    <label htmlFor={`payment-status-${booking.id}`}>Cập nhật thanh toán</label>
                    <select id={`payment-status-${booking.id}`}
                        value={paymentChoices[booking.id] ?? booking.paymentStatus}
                        onChange={(event) => setPaymentChoices({ ...paymentChoices, [booking.id]: event.target.value as PaymentStatus })}>
                        <option value="UNPAID">Chưa thanh toán</option>
                        {booking.paymentMethod === 'BANK_TRANSFER_DEPOSIT' && <option value="DEPOSIT_PAID">Đã nhận cọc</option>}
                        <option value="PAID">Đã thanh toán</option>
                    </select>
                    <button type="button" onClick={() => void savePayment(booking)} disabled={actionId === booking.id}>
                        Lưu thanh toán
                    </button>
                </div>}
            </article>)}
        </div>
    </section>;
}
