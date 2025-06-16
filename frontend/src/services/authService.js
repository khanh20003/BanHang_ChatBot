import axios from 'axios';
import API_URL from '../config/api';

const authService = {
    login: async (username, password) => {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post(`${API_URL}/auth/login`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            if (response.data.access_token) {
                // Lấy profile user sau khi đăng nhập thành công
                const profile = await authService.fetchUserProfile(response.data.access_token);
                // Lưu cả token và profile vào localStorage
                const userData = {
                    ...profile,
                    access_token: response.data.access_token,
                    token_type: response.data.token_type
                };
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    fetchUserProfile: async (access_token) => {
        // Đổi endpoint từ /auth/profile sang /auth/me
        const res = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        return res.data;
    },

    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('customerId'); // Xóa luôn customerId khi logout
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    getAuthHeader: () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.access_token) {
            return { Authorization: `Bearer ${user.access_token}` };
        }
        return {};
    }
};

export default authService;