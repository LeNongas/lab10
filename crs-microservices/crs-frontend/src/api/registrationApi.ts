import axiosClient from './axiosClient';
import type {
    Registration,
    RegistrationRequest,
} from '../types/registration';

// Đăng ký học phần
export function registerCourse(data: RegistrationRequest) {
    return axiosClient.post<Registration>(
        '/api/registrations',
        data
    );
}

// Buổi 9:
// Lấy danh sách học phần của sinh viên đang đăng nhập
export function getMyRegistrations() {
    return axiosClient.get<Registration[]>(
        '/api/registrations/my'
    );
}

// Buổi 9:
// Hủy đăng ký học phần
export function cancelRegistration(id: number) {
    return axiosClient.delete(
        `/api/registrations/${id}`
    );
}