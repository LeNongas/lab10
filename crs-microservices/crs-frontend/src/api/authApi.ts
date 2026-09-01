import axiosClient from './axiosClient';
import type { LoginResponse } from '../types/auth';

export function loginRequest(username: string, password: string) {
    return axiosClient.post<LoginResponse>('/api/auth/login', { username, password });
}
