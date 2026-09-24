import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

import { getRooms } from './roomApi';
import type { Room } from '../types/room';

export type LoadState =
    | 'loading'
    | 'success'
    | 'empty'
    | 'error';

interface RoomPageResponse {
    content: Room[];
    totalPages: number;
}

interface ErrorResponse {
    message?: string;
}

export function useRooms(
    keyword: string,
    page: number,
    size: number = 10,
    categoryId?: number,
    sort: string = 'id,desc',
    checkIn?: string,
    checkOut?: string,
    guests?: number,
    roomId?: number
) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [totalPages, setTotalPages] = useState<number>(0);

    const [state, setState] =
        useState<LoadState>('loading');

    const [errorMessage, setErrorMessage] =
        useState<string>('');
    const latestRequest = useRef(0);

    const fetchRooms = useCallback(async (): Promise<void> => {
        const requestNumber = ++latestRequest.current;
        // Bắt đầu gọi API
        setState('loading');
        setErrorMessage('');

        try {
            const response = await getRooms(
                keyword,
                page,
                size,
                categoryId,
                sort,
                checkIn,
                checkOut,
                guests,
                roomId
            );
            if (requestNumber !== latestRequest.current) return;

            const data = response.data as RoomPageResponse;

            const roomList: Room[] =
                Array.isArray(data?.content)
                    ? data.content
                    : [];

            const pages: number =
                typeof data?.totalPages === 'number'
                    ? data.totalPages
                    : 0;

            setRooms(roomList);
            setTotalPages(pages);

            if (roomList.length === 0) {
                setState('empty');
            } else {
                setState('success');
            }
        } catch (error: unknown) {
            if (requestNumber !== latestRequest.current) return;
            // Xóa dữ liệu cũ khi có lỗi
            setRooms([]);
            setTotalPages(0);

            let message =
                'Đã xảy ra lỗi không xác định, vui lòng thử lại.';

            if (axios.isAxiosError(error)) {
                // Có response từ backend
                if (error.response) {
                    const errorData =
                        error.response.data as ErrorResponse;

                    if (errorData?.message) {
                        message = errorData.message;
                    } else {
                        message =
                            `Lỗi hệ thống: ${error.response.status}`;
                    }
                } else {
                    // Không nhận được response:
                    // Gateway hoặc service đang tắt
                    message =
                        'Không kết nối được tới hệ thống. Vui lòng thử lại sau.';
                }
            }

            setErrorMessage(message);
            setState('error');
        }
    }, [keyword, page, size, categoryId, sort, checkIn, checkOut, guests, roomId]);

    useEffect(() => {
        void fetchRooms();
    }, [fetchRooms]);

    return {
        rooms,
        totalPages,
        state,
        errorMessage,
        refetch: fetchRooms,
    };
}
