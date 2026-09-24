import axiosClient from './axiosClient';

export interface CalendarDay {
    date: string;
    booked: number;
    blocked: number;
    available: number;
}

export interface CalendarRoom {
    roomId: number;
    roomName: string;
    quantity: number;
    days: CalendarDay[];
}

export interface RoomBlock {
    id: number;
    roomId: number;
    roomName: string;
    startDate: string;
    endDate: string;
    units: number;
    reason: string;
}

export interface CalendarResponse {
    month: string;
    rooms: CalendarRoom[];
    blocks: RoomBlock[];
}

export interface BlockValues {
    roomId: number;
    startDate: string;
    endDate: string;
    units: number;
    reason: string;
}

export const getCalendar = (month: string) => axiosClient.get<CalendarResponse>('/api/admin/calendar', { params: { month } });
export const createBlock = (values: BlockValues) => axiosClient.post<RoomBlock>('/api/admin/calendar/blocks', values);
export const deleteBlock = (id: number) => axiosClient.delete(`/api/admin/calendar/blocks/${id}`);
