import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { cancelBooking, choosePaymentMethod, getMyBookings, getPaymentOptions } from '../api/bookingApi';
import type { Booking, PaymentMethod } from '../types/booking';

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

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState<number | null>(null);
    const [choices, setChoices] = useState<Record<number, PaymentMethod>>({});
    const [bankTransferAvailable, setBankTransferAvailable] = useState(false);

    const loadBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        void getPaymentOptions().then(({ data }) => setBankTransferAvailable(data.bankTransferAvailable))
            .catch(() => setBankTransferAvailable(false));
        try {
            setBookings((await getMyBookings()).data);
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void loadBookings(); }, [loadBookings]);

    const savePaymentMethod = async (booking: Booking) => {
        setActionId(booking.id);
        setError('');
        try {
            await choosePaymentMethod(booking.id, choices[booking.id] ?? (bankTransferAvailable ? 'BANK_TRANSFER_DEPOSIT' : 'PAY_AT_CHECKIN'));
            await loadBookings();
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setActionId(null);
        }
    };

    const cancel = async (booking: Booking) => {
        if (!window.confirm(`Hủy yêu cầu đặt "${booking.roomName}"?`)) return;
        setActionId(booking.id);
        setError('');
        try {
            await cancelBooking(booking.id);
            await loadBookings();
        } catch (requestError) {
            setError(errorText(requestError));
        } finally {
            setActionId(null);
        }
    };

    return <section>
        <span className="eyebrow">KỲ NGHỈ CỦA BẠN</span>
        <h1>Phòng đã đặt</h1>
        <button type="button" onClick={() => void loadBookings()} disabled={loading}>Tải lại</button>
        {loading && <p>Đang tải...</p>}
        {error && <div className="message error" role="alert">{error}</div>}
        {!loading && bookings.length === 0 && <p>Bạn chưa có yêu cầu đặt phòng nào.</p>}
        <div className="booking-list">
            {bookings.map((booking) => <article className="card" key={booking.id}>
                <div className="booking-heading">
                    <h2>{booking.roomName}</h2>
                    <strong>{bookingStatus[booking.status]}</strong>
                </div>
                <p>Nhận phòng: {booking.checkIn} · Trả phòng: {booking.checkOut} · {booking.guests} khách</p>
                {booking.guestFullName && <p>Người liên hệ: {booking.guestFullName}{booking.guestPhone && ` · ${booking.guestPhone}`}</p>}
                {booking.checkInNote && <p>Ghi chú nhận phòng: {booking.checkInNote}</p>}
                <p>Tổng tiền: <strong>{booking.totalPrice == null ? 'Chưa có dữ liệu' : `${money.format(booking.totalPrice)} đ`}</strong></p>
                {booking.depositAmount != null && booking.paymentMethod !== 'PAY_AT_CHECKIN' &&
                    <p>{booking.paymentMethod ? 'Tiền cọc' : 'Tiền cọc nếu chuyển khoản'} ({booking.depositPercent}%):
                        {' '}<strong>{money.format(booking.depositAmount)} đ</strong></p>}
                <p>Thanh toán: {paymentStatus[booking.paymentStatus]}</p>
                {booking.statusReason && <p className="booking-reason"><strong>Lý do {booking.status === 'REJECTED' ? 'từ chối' : 'hủy'}:</strong> {booking.statusReason}</p>}
                {booking.paymentMethod
                    ? <><p>Cách thanh toán: {paymentMethod[booking.paymentMethod]}</p>
                        {booking.paymentMethod === 'BANK_TRANSFER_DEPOSIT' && booking.bankAccountNumber
                            && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && <div className="deposit-details">
                            <strong>Thông tin chuyển khoản đặt cọc</strong>
                            <p>Ngân hàng: {booking.bankName}</p>
                            <p>Số tài khoản: <strong>{booking.bankAccountNumber}</strong></p>
                            <p>Chủ tài khoản: {booking.bankAccountHolder}</p>
                            <p>Nội dung chuyển khoản: <strong>{booking.transferReference}</strong></p>
                            <p>Chuyển đúng số tiền cọc và ghi đúng nội dung để quản trị viên đối chiếu.</p>
                        </div>}
                        {booking.paymentMethod === 'BANK_TRANSFER_DEPOSIT' && !booking.bankAccountNumber
                            && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') &&
                            <p>Thông tin chuyển khoản đang được quản trị viên bổ sung.</p>}
                        {booking.status === 'PENDING' && booking.paymentMethod === 'BANK_TRANSFER_DEPOSIT' && booking.paymentStatus === 'UNPAID' &&
                            <p>Quản trị viên sẽ cập nhật trạng thái sau khi nhận tiền đặt cọc.</p>}</>
                    : booking.status === 'PENDING' && <div className="payment-choice">
                        <label htmlFor={`payment-method-${booking.id}`}>Chọn cách thanh toán</label>
                        <select id={`payment-method-${booking.id}`}
                            value={choices[booking.id] ?? (bankTransferAvailable ? 'BANK_TRANSFER_DEPOSIT' : 'PAY_AT_CHECKIN')}
                            onChange={(event) => setChoices({ ...choices, [booking.id]: event.target.value as PaymentMethod })}>
                            {bankTransferAvailable && <option value="BANK_TRANSFER_DEPOSIT">Chuyển khoản đặt cọc</option>}
                            <option value="PAY_AT_CHECKIN">Thanh toán khi nhận phòng</option>
                        </select>
                        {!bankTransferAvailable && <span>Chuyển khoản đặt cọc chưa được thiết lập.</span>}
                        <button type="button" onClick={() => void savePaymentMethod(booking)} disabled={actionId === booking.id}>
                            Lưu cách thanh toán
                        </button>
                    </div>}
                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && booking.paymentStatus === 'UNPAID' && <button type="button" className="danger"
                    onClick={() => void cancel(booking)} disabled={actionId === booking.id}>
                    Hủy đặt phòng
                </button>}
            </article>)}
        </div>
    </section>;
}
