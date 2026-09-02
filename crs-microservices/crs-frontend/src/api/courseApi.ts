import axiosClient from './axiosClient';
import type { Course } from '../types/course';

export interface CourseFormValues {
    tenMonHoc: string;
    soTinChi: number;
    soChoToiDa: number;
}

// Lấy danh sách môn học
export const getCourses = (
    keyword: string = '',
    page: number = 0,
    size: number = 10
) => {
    return axiosClient.get('/api/courses', {
        params: {
            keyword,
            page,
            size,
        },
    });
};

// Buổi 9:
// Lấy thông tin một môn học theo id
export const getCourseById = (id: number) => {
    return axiosClient.get<Course>(
        `/api/courses/${id}`
    );
};

// Chuẩn hóa dữ liệu trước khi gửi lên backend
const toPayload = (values: CourseFormValues) => ({
    tenMonHoc: values.tenMonHoc.trim(),
    soTinChi: Number(values.soTinChi),
    soChoToiDa: Number(values.soChoToiDa),
});

// Thêm môn học
export const createCourse = (
    values: CourseFormValues
) => {
    return axiosClient.post(
        '/api/courses',
        toPayload(values)
    );
};

// Sửa môn học
export const updateCourse = (
    id: number,
    values: CourseFormValues
) => {
    return axiosClient.put(
        `/api/courses/${id}`,
        toPayload(values)
    );
};

// Xóa môn học
export const deleteCourse = (id: number) => {
    return axiosClient.delete(
        `/api/courses/${id}`
    );
};