import axiosClient from './axiosClient';

export interface ManagedUser {
    id: number;
    username: string;
    role: 'ADMIN' | 'CUSTOMER';
}

export interface UserValues {
    username: string;
    password: string;
    role: ManagedUser['role'];
}

export const getUsers = () => axiosClient.get<ManagedUser[]>('/api/users');
export const createUser = (values: UserValues) => axiosClient.post<ManagedUser>('/api/users', values);
export const updateUser = (id: number, values: UserValues) => axiosClient.put<ManagedUser>(`/api/users/${id}`, values);
export const deleteUser = (id: number) => axiosClient.delete(`/api/users/${id}`);
