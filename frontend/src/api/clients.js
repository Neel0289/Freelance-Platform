import api from './axios';

export const clientsApi = {
    list: async (params) => {
        const { data } = await api.get('/clients/', { params });
        return data;
    },

    get: async (id) => {
        const { data } = await api.get(`/clients/${id}/`);
        return data;
    },

    create: async (clientData) => {
        const { data } = await api.post('/clients/', clientData);
        return data;
    },

    update: async (id, clientData) => {
        const { data } = await api.patch(`/clients/${id}/`, clientData);
        return data;
    },

    delete: async (id) => {
        await api.delete(`/clients/${id}/`);
    },
};
