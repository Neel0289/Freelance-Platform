import api from './axios';

export const notificationsApi = {
    list: async () => {
        const { data } = await api.get('/notifications/');
        return data;
    },

    markRead: async (id) => {
        await api.post(`/notifications/${id}/mark-read/`);
    },

    markAllRead: async () => {
        await api.post('/notifications/mark-all-read/');
    }
};
