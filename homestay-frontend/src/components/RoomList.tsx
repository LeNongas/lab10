import type { Room } from '../types/room';
import type { LoadState } from '../api/useRooms';

interface RoomListProps {
    rooms: Room[];
    state: LoadState;
    errorMessage: string;
    onRetry: () => void;
    onEdit?: (room: Room) => void;
    onDelete?: (room: Room) => void;
    onRegister?: (room: Room) => void;
    registeringId?: number | null;
    bookingNights?: number;
}

export default function RoomList({ rooms, state, errorMessage, onRetry, onEdit,
    onDelete, onRegister, registeringId, bookingNights }: RoomListProps) {
    if (state === 'loading') return <p>Đang tải danh sách phòng...</p>;
    if (state === 'error') return <div className="message error">
        <p>{errorMessage}</p><button type="button" onClick={onRetry}>Thử lại</button>
    </div>;
    if (state === 'empty') return <p>Không tìm thấy phòng nào phù hợp.</p>;

    return <div className="room-grid">
        {rooms.map((room) => <article className="room-card" key={room.id}>
            {room.imageUrl
                ? <img className="room-photo" src={new URL(room.imageUrl, 'http://localhost:8084').toString()} alt={room.name} />
                : <div className="room-photo room-photo-empty">Homestay</div>}
            <div className="room-card-body">
                {room.categoryName && <span className="room-category">{room.categoryName}</span>}
                <h2>{room.name}</h2>
                {room.description && <p className="room-description">{room.description}</p>}
                <div className="room-details">
                    <span>Tối đa {room.maxGuests ?? '-'} khách</span>
                    <span>{room.availableForStay == null
                        ? `${room.availableToday} / ${room.quantity} phòng hôm nay`
                        : `${room.availableForStay} / ${room.quantity} phòng trống trong kỳ lưu trú`}</span>
                </div>
                {room.pricePerNight != null && <p className="room-price">
                    {new Intl.NumberFormat('vi-VN').format(room.pricePerNight)} đ <small>/ đêm</small>
                </p>}
                {onRegister && bookingNights && room.pricePerNight != null &&
                    <p className="booking-total">Tổng {bookingNights} đêm: <strong>
                        {new Intl.NumberFormat('vi-VN').format(room.pricePerNight * bookingNights)} đ
                    </strong></p>}
                {(onEdit || onDelete || onRegister) && <div className="room-actions">
                    {onEdit && <button type="button" onClick={() => onEdit(room)}>Sửa</button>}
                    {onDelete && <button type="button" className="danger" onClick={() => onDelete(room)}>Xóa</button>}
                    {onRegister && <button type="button" onClick={() => onRegister(room)}
                        disabled={registeringId === room.id || room.availableForStay === 0}>
                        {room.availableForStay === 0 ? 'Đã hết phòng' : registeringId === room.id ? 'Đang đặt...' : 'Đặt phòng'}
                    </button>}
                </div>}
            </div>
        </article>)}
    </div>;
}
