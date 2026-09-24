import axiosClient from './axiosClient';

export interface RoomCategory {
    id: number;
    name: string;
}

export const getCategories = () => axiosClient.get<RoomCategory[]>('/api/categories');
export const createCategory = (name: string) => axiosClient.post<RoomCategory>('/api/categories', { name });
export const updateCategory = (id: number, name: string) => axiosClient.put<RoomCategory>(`/api/categories/${id}`, { name });
export const deleteCategory = (id: number) => axiosClient.delete(`/api/categories/${id}`);
