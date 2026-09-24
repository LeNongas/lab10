import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8084',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('homestay_token');

        const url = config.url ?? '';
        const method = config.method?.toLowerCase();

        // Các API public không cần JWT
        const isPublicAuthRequest = url === '/api/auth/login' || url === '/api/auth/register';

        const isPublicRoomRequest =
            method === 'get' &&
            url.startsWith('/api/rooms');

        // Chỉ gắn JWT cho các API cần đăng nhập
        if (token && !isPublicAuthRequest && !isPublicRoomRequest) {
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
            localStorage.removeItem('homestay_token');
            localStorage.removeItem('homestay_user');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
