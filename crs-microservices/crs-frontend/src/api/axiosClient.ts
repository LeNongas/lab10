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

export default axiosClient;