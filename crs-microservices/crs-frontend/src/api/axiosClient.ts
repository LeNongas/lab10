import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('crs_token');

        const url = config.url ?? '';
        const method = config.method?.toLowerCase();

        // Các API public không cần JWT
        const isLoginRequest = url === '/api/auth/login';

        const isPublicCourseRequest =
            method === 'get' &&
            url.startsWith('/api/courses');

        // Chỉ gắn JWT cho các API cần đăng nhập
        if (token && !isLoginRequest && !isPublicCourseRequest) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
// Token hết hạn hoặc không hợp lệ -> đăng xuất
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 401
        ) {
            localStorage.removeItem('crs_token');
            localStorage.removeItem('crs_user');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;