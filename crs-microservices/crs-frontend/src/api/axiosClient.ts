import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động lấy JWT token và gắn vào mỗi request
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('crs_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Phiên đăng nhập hết hạn: xóa dữ liệu cũ và đưa người dùng về trang đăng nhập.
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('crs_token');
            localStorage.removeItem('crs_user');

            if (window.location.pathname !== '/login') {
                window.location.assign('/login');
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
