import axiosClient from './axiosClient';
import type { Room } from '../types/room';

export interface RoomFormValues {
    name: string;
    maxGuests: number;
    quantity: number;
    pricePerNight: number;
    description: string;
    categoryId: number;
}

// Lấy danh sách phòng
export const getRooms = (
    keyword: string = '',
    page: number = 0,
    size: number = 10,
    categoryId?: number,
    sort: string = 'id,desc',
    checkIn?: string,
    checkOut?: string,
    guests?: number,
    roomId?: number
) => {
    return axiosClient.get('/api/rooms', {
        params: {
            keyword,
            page,
            size,
            categoryId,
            sort,
            checkIn,
            checkOut,
            guests,
            roomId,
        },
    });
};

// Lấy thông tin một phòng theo id
export const getRoomById = (id: number) => {
    return axiosClient.get<Room>(
        `/api/rooms/${id}`
    );
};

// Chuẩn hóa dữ liệu trước khi gửi lên backend
const toPayload = (values: RoomFormValues) => ({
    name: values.name.trim(),
    maxGuests: Number(values.maxGuests),
    quantity: Number(values.quantity),
    pricePerNight: Number(values.pricePerNight),
    description: values.description.trim(),
    categoryId: Number(values.categoryId),
});

// Thêm phòng
export const createRoom = (
    values: RoomFormValues
) => {
    return axiosClient.post(
        '/api/rooms',
        toPayload(values)
    );
};

// Sửa phòng
export const updateRoom = (
    id: number,
    values: RoomFormValues
) => {
    return axiosClient.put(
        `/api/rooms/${id}`,
        toPayload(values)
    );
};

// Xóa phòng
export const deleteRoom = (id: number) => {
    return axiosClient.delete(
        `/api/rooms/${id}`
    );
};

export const uploadRoomImage = (id: number, file: File) => {
    const data = new FormData();
    data.append('file', file);
    return axiosClient.post(`/api/rooms/${id}/upload-image`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
