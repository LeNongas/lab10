import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api/categoryApi';
import type { RoomCategory } from '../api/categoryApi';
import { useRooms } from '../api/useRooms';
import { useAuth } from '../hooks/useAuth';
import RoomList from '../components/RoomList';
import Pagination from '../components/Pagination';

export default function RoomPage() {
    const [destination, setDestination] = useState('');
    const [keyword, setKeyword] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [searchedStay, setSearchedStay] = useState<{ checkIn: string; checkOut: string; guests: number } | null>(null);
    const [searchError, setSearchError] = useState('');
    const [page, setPage] = useState(0);
    const [categoryId, setCategoryId] = useState<number | undefined>();
    const [sort, setSort] = useState('id,desc');
    const [categories, setCategories] = useState<RoomCategory[]>([]);
    const { user } = useAuth();
    const navigate = useNavigate();
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    useEffect(() => {
        void getCategories().then((response) => setCategories(response.data)).catch(() => setCategories([]));
    }, []);

    const { rooms, totalPages, state, errorMessage, refetch } = useRooms(
        keyword, page, 6, categoryId, sort,
        searchedStay?.checkIn, searchedStay?.checkOut, searchedStay?.guests
    );

    const bookingUrl = (roomId?: number, roomName?: string) => {
        const params = new URLSearchParams();
        if (roomName || destination.trim()) params.set('keyword', roomName || destination.trim());
        if (checkIn) params.set('checkIn', checkIn);
        if (checkOut) params.set('checkOut', checkOut);
        params.set('guests', String(guests));
        if (roomId) params.set('roomId', String(roomId));
        return `/book-room?${params.toString()}`;
    };

    const search = (event: FormEvent) => {
        event.preventDefault();
        if (!checkIn || !checkOut || checkIn < today || checkOut <= checkIn) {
            setSearchError('Vui lòng chọn ngày nhận và trả phòng hợp lệ.');
            return;
        }
        if (!Number.isInteger(guests) || guests < 1) {
            setSearchError('Vui lòng nhập số khách hợp lệ.');
            return;
        }
        setSearchError('');
        setKeyword(destination.trim());
        setSearchedStay({ checkIn, checkOut, guests });
        setPage(0);
        if (user?.role === 'CUSTOMER') {
            navigate(bookingUrl());
        } else {
            document.getElementById('featured-rooms')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return <>
        <section className="home-hero">
            <div className="hero-shade" />
            <div className="content-container hero-content">
                <span className="hero-eyebrow">NEST HOMESTAY & RETREATS</span>
                <h1><span>Chạm vào bình yên.</span><br />Ở lại theo cách của bạn.</h1>
                <p>Mỗi không gian là một lời mời nghỉ ngơi, tận hưởng và bắt đầu những ngày thật khác.</p>
                <a href="#featured-rooms" className="hero-link">KHÁM PHÁ PHÒNG <span aria-hidden="true">↗</span></a>
            </div>
            <span className="hero-caption">NEST · MỘT CHỐN DỪNG CHÂN RIÊNG</span>
        </section>

        <section className="search-band" aria-label="Tìm phòng">
            <form className="search-panel content-container" onSubmit={search}>
                <label className="search-field search-destination">
                    <span>ĐIỂM ĐẾN CỦA BẠN</span>
                    <input value={destination} onChange={(event) => setDestination(event.target.value)}
                        placeholder="Tên phòng hoặc không gian..." />
                </label>
                <label className="search-field">
                    <span>NHẬN PHÒNG</span>
                    <input type="date" min={today} value={checkIn} required onChange={(event) => {
                        const nextCheckIn = event.target.value;
                        setCheckIn(nextCheckIn);
                        if (checkOut && checkOut <= nextCheckIn) setCheckOut('');
                    }} />
                </label>
                <label className="search-field">
                    <span>TRẢ PHÒNG</span>
                    <input type="date" min={checkIn || today} value={checkOut} required onChange={(event) => setCheckOut(event.target.value)} />
                </label>
                <label className="search-field search-guests">
                    <span>KHÁCH LƯU TRÚ</span>
                    <input type="number" min="1" step="1" required value={guests} onChange={(event) => {
                        const value = Number(event.target.value);
                        setGuests(Number.isFinite(value) ? Math.max(1, value) : 1);
                    }} />
                </label>
                <button type="submit" className="search-submit">KIỂM TRA PHÒNG <span aria-hidden="true">↗</span></button>
            </form>
            {searchError && <p className="message error content-container" role="alert">{searchError}</p>}
        </section>

        <section className="home-intro content-container">
            <div className="section-heading">
                <span className="eyebrow">CHÀO MỪNG ĐẾN VỚI NEST</span>
                <h2>Một nơi để dừng lại.<br />Một nơi để bắt đầu.</h2>
                <p>Từ căn phòng ấm cúng đến không gian giữa thiên nhiên, mỗi lựa chọn mang đến cảm giác thân thuộc và một kỳ nghỉ thật riêng.</p>
            </div>
            <div className="intro-features">
                <div><strong>01</strong><span>Không gian riêng tư</span></div>
                <div><strong>02</strong><span>Giá phòng rõ ràng</span></div>
                <div><strong>03</strong><span>Đặt chỗ dễ dàng</span></div>
            </div>
        </section>

        <section id="featured-rooms" className="rooms-section">
            <div className="content-container">
                <div className="rooms-section-heading">
                    <div><span className="eyebrow">PHÒNG & KHÔNG GIAN</span><h2>Chọn nơi ở dành cho bạn</h2></div>
                    <p>{searchedStay
                        ? `Phòng còn trống từ ${searchedStay.checkIn} đến ${searchedStay.checkOut} cho ${searchedStay.guests} khách.`
                        : 'Không gian nghỉ ngơi phù hợp cho từng hành trình.'}</p>
                </div>
                <div className="rooms-filters">
                    <select value={categoryId ?? ''} onChange={(event) => { setCategoryId(event.target.value ? Number(event.target.value) : undefined); setPage(0); }} aria-label="Loại phòng">
                        <option value="">Mọi loại phòng</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(0); }} aria-label="Sắp xếp phòng">
                        <option value="id,desc">Mới thêm</option>
                        <option value="pricePerNight,asc">Giá thấp đến cao</option>
                        <option value="pricePerNight,desc">Giá cao đến thấp</option>
                        <option value="name,asc">Tên A-Z</option>
                    </select>
                </div>
                <RoomList rooms={rooms} state={state} errorMessage={errorMessage} onRetry={refetch}
                    onRegister={(room) => {
                        const target = bookingUrl(room.id, room.name);
                        navigate(user?.role === 'CUSTOMER' ? target : `/login?next=${encodeURIComponent(target)}`);
                    }} />
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </section>

        <section className="home-invite">
            <div className="content-container invite-inner">
                <div><span className="eyebrow">KỲ NGHỈ TIẾP THEO</span><h2>Ở lại lâu hơn một chút.</h2><p>Tìm ngày phù hợp và để NEST chuẩn bị nơi dừng chân cho bạn.</p></div>
                <button type="button" onClick={() => {
                    const target = bookingUrl();
                    navigate(user?.role === 'CUSTOMER' ? target : `/login?next=${encodeURIComponent(target)}`);
                }}>ĐẶT PHÒNG NGAY ↗</button>
            </div>
        </section>
        <footer className="home-footer"><div className="content-container footer-inner"><div><strong>NEST.</strong><span>HOMESTAY & RETREATS</span></div><p>Không gian lưu trú dành cho những ngày bạn muốn sống chậm lại.</p><a href="#featured-rooms">KHÁM PHÁ PHÒNG ↗</a></div></footer>
    </>;
}
