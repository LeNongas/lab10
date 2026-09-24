import { useEffect, useState } from 'react';
import { getCategories } from '../api/categoryApi';
import type { RoomCategory } from '../api/categoryApi';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useRooms } from '../api/useRooms';
import { bookRoom } from '../api/bookingApi';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

import RoomList from '../components/RoomList';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';

import type { Room } from '../types/room';

interface ApiErrorResponse {
    message?: string;
}

export default function BookRoomPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const roomIdFromUrl = Number(searchParams.get('roomId'));
    const selectedRoomId = Number.isInteger(roomIdFromUrl) && roomIdFromUrl > 0 ? roomIdFromUrl : undefined;

    const [keyword, setKeyword] =
        useState(searchParams.get('keyword') ?? '');

    const [page, setPage] =
        useState(0);
    const [categoryId, setCategoryId] = useState<number | undefined>();
    const [categories, setCategories] = useState<RoomCategory[]>([]);
    const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') ?? '');
    const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') ?? '');
    const [guests, setGuests] = useState(Math.max(1, Number(searchParams.get('guests') ?? 1)));
    const [guestFullName, setGuestFullName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [checkInNote, setCheckInNote] = useState('');
    const clearSelectedRoom = () => {
        if (selectedRoomId) {
            setSearchParams((current) => {
                const next = new URLSearchParams(current);
                next.delete('roomId');
                return next;
            }, { replace: true });
            setPage(0);
        }
    };
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const bookingNights = checkIn && checkOut && checkOut > checkIn
        ? Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000)
        : 0;
    useEffect(() => { void getCategories().then((response) => setCategories(response.data)).catch(() => setCategories([])); }, []);

    const [registeringId, setRegisteringId] =
        useState<number | null>(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    const {
        toast,
        showToast,
        clearToast,
    } = useToast();

    const {
        rooms,
        totalPages,
        state,
        errorMessage,
        refetch,
    } = useRooms(
        keyword,
        page,
        10,
        categoryId,
        'id,desc',
        checkIn && checkOut && checkIn >= today && checkOut > checkIn ? checkIn : undefined,
        checkIn && checkOut && checkIn >= today && checkOut > checkIn ? checkOut : undefined,
        guests,
        selectedRoomId
    );

    // ============================
    // ĐẶT PHÒNG
    // ============================
    const handleRegister = async (
        room: Room
    ) => {

        if (!user) {
            return;
        }
        if (!checkIn || !checkOut || checkIn < today || checkOut <= checkIn) {
            showToast('Vui lòng chọn ngày nhận và trả phòng hợp lệ.', 'error');
            return;
        }
        if (guests < 1 || guests > room.maxGuests) {
            showToast('Số khách vượt quá sức chứa phòng.', 'error');
            return;
        }
        const digits = guestPhone.replace(/\D/g, '');
        if (!guestFullName.trim() || digits.length < 9 || digits.length > 15 || !/^[0-9+().\s-]+$/.test(guestPhone.trim())) {
            showToast('Vui lòng nhập họ tên và số điện thoại liên hệ hợp lệ.', 'error');
            return;
        }

        const total = room.pricePerNight * bookingNights;
        if (!window.confirm(`Đặt "${room.name}" ${bookingNights} đêm với tổng tiền ${new Intl.NumberFormat('vi-VN').format(total)} đ?`)) {
            return;
        }

        setRegisteringId(room.id);

        try {

            const { data } = await bookRoom({
                roomId: room.id,
                checkIn,
                checkOut,
                guests,
                guestFullName: guestFullName.trim(),
                guestPhone: guestPhone.trim(),
                checkInNote: checkInNote.trim(),
            });

            showToast(`Đã gửi yêu cầu đặt "${room.name}". Tổng tiền: ${new Intl.NumberFormat('vi-VN').format(data.totalPrice ?? total)} đ`, 'success');
            void refetch();
            navigate('/my-bookings');

        } catch (err) {

            let message =
                'Đặt phòng không thành công, vui lòng thử lại.';

            if (
                axios.isAxiosError<ApiErrorResponse>(err) &&
                err.response?.data?.message
            ) {
                message =
                    err.response.data.message;
            }

            showToast(
                message,
                'error'
            );

        } finally {

            setRegisteringId(null);
        }
    };

    return (
        <div className="booking-page">
            <span className="eyebrow">LỰA CHỌN KỲ NGHỈ CỦA BẠN</span>
            <h1>Đặt phòng homestay</h1>
            <p className="page-lead">Chọn ngày lưu trú để xem tổng tiền trước khi gửi yêu cầu đặt phòng.</p>

            <div className="booking-filters">
                <label>TÌM PHÒNG <input type="search" value={keyword} onChange={(event) => { clearSelectedRoom(); setKeyword(event.target.value); setPage(0); }} placeholder="Tên phòng..." /></label>
                <label>NHẬN PHÒNG <input type="date" min={today} value={checkIn} onChange={(event) => {
                    const nextCheckIn = event.target.value;
                    setCheckIn(nextCheckIn);
                    if (checkOut && checkOut <= nextCheckIn) setCheckOut('');
                }} /></label>
                <label>TRẢ PHÒNG <input type="date" min={checkIn || today} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /></label>
                <label>SỐ KHÁCH <input type="number" min="1" value={guests} onChange={(event) => {
                    const value = Number(event.target.value);
                    setGuests(Number.isFinite(value) ? Math.max(1, value) : 1);
                }} /></label>
                <select aria-label="Loại phòng" value={categoryId ?? ''} onChange={(event) => { clearSelectedRoom(); setCategoryId(event.target.value ? Number(event.target.value) : undefined); setPage(0); }}>
                    <option value="">Mọi loại phòng</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
            </div>

            <div className="card booking-contact">
                <h2>Thông tin liên hệ và nhận phòng</h2>
                <div className="booking-contact-grid">
                    <label className="field">Họ tên khách đặt <span aria-hidden="true">*</span>
                        <input value={guestFullName} maxLength={100} autoComplete="name" required
                            onChange={(event) => setGuestFullName(event.target.value)} placeholder="Họ và tên" />
                    </label>
                    <label className="field">Số điện thoại <span aria-hidden="true">*</span>
                        <input type="tel" value={guestPhone} maxLength={20} autoComplete="tel" required
                            onChange={(event) => setGuestPhone(event.target.value)} placeholder="Số liên hệ khi nhận phòng" />
                    </label>
                    <label className="field booking-note">Ghi chú nhận phòng
                        <textarea value={checkInNote} maxLength={500}
                            onChange={(event) => setCheckInNote(event.target.value)} placeholder="Ví dụ: đến muộn, cần thêm thông tin..." />
                    </label>
                </div>
            </div>

            <div
                style={{
                    marginTop: 16,
                }}
            >
                <RoomList
                    rooms={rooms}
                    state={state}
                    errorMessage={errorMessage}
                    onRetry={refetch}
                    onRegister={handleRegister}
                    registeringId={registeringId}
                    bookingNights={bookingNights}
                />
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={clearToast}
                />
            )}
        </div>
    );
}
