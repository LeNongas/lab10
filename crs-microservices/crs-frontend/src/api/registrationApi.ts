import axiosClient from './axiosClient';
import type { Registration, RegistrationRequest } from '../types/registration';

export function registerCourse(data: RegistrationRequest) {
    return axiosClient.post<Registration>('/api/registrations', data);
}
