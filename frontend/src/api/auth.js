import api from './axios';

export const authApi = {
    getUser: async () => {
        const { data } = await api.get('/auth/user/');
        return data;
    },

    login: async (credentials) => {
        const { data } = await api.post('/auth/login/', credentials);
        return data;
    },

    register: async (userData) => {
        const { data } = await api.post('/auth/registration/', userData);
        return data;
    },

    logout: async () => {
        const { data } = await api.post('/auth/logout/');
        return data;
    },
};
