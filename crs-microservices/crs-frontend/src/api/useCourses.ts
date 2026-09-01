import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { getCourses } from './courseApi';
import type { Course } from '../types/course';

export type LoadState =
    | 'loading'
    | 'success'
    | 'empty'
    | 'error';

interface CoursePageResponse {
    content: Course[];
    totalPages: number;
}

interface ErrorResponse {
    message?: string;
}

export function useCourses(
    keyword: string,
    page: number,
    size: number = 10
) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [totalPages, setTotalPages] = useState<number>(0);

    const [state, setState] =
        useState<LoadState>('loading');

    const [errorMessage, setErrorMessage] =
        useState<string>('');

    const fetchCourses = useCallback(async (): Promise<void> => {
        // Bắt đầu gọi API
        setState('loading');
        setErrorMessage('');

        try {
            const response = await getCourses(
                keyword,
                page,
                size
            );

            const data = response.data as CoursePageResponse;

            const courseList: Course[] =
                Array.isArray(data?.content)
                    ? data.content
                    : [];

            const pages: number =
                typeof data?.totalPages === 'number'
                    ? data.totalPages
                    : 0;

            setCourses(courseList);
            setTotalPages(pages);

            if (courseList.length === 0) {
                setState('empty');
            } else {
                setState('success');
            }
        } catch (error: unknown) {
            // Xóa dữ liệu cũ khi có lỗi
            setCourses([]);
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
    }, [keyword, page, size]);

    useEffect(() => {
        void fetchCourses();
    }, [fetchCourses]);

    return {
        courses,
        totalPages,
        state,
        errorMessage,
        refetch: fetchCourses,
    };
}