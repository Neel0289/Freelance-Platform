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

    firebaseLogin: async (idToken, role) => {
        const { data } = await api.post('/auth/google/firebase/', { id_token: idToken, role });
        return data;
    },

    forgotPassword: async (email) => {
        const { data } = await api.post('/auth/password/reset/', { email });
        return data;
    },

    resetPasswordConfirm: async (uid, token, password) => {
        const { data } = await api.post('/auth/password/reset/confirm/', {
            uid,
            token,
            new_password1: password,
            new_password2: password,
        });
        return data;
    },
};
