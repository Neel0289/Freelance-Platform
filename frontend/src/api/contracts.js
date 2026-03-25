import api from './axios';

export const contractsApi = {
    list: async (params) => {
        const { data } = await api.get('/contracts/', { params });
        return data;
    },

    get: async (id) => {
        const { data } = await api.get(`/contracts/${id}/`);
        return data;
    },

    create: async (contractData) => {
        const { data } = await api.post('/contracts/', contractData);
        return data;
    },

    update: async (id, contractData) => {
        const { data } = await api.patch(`/contracts/${id}/`, contractData);
        return data;
    },

    delete: async (id) => {
        await api.delete(`/contracts/${id}/`);
    },

    send: async (id) => {
        await api.post(`/contracts/${id}/send/`);
    },

    sign: async (token, signatureData) => {
        await api.post(`/contracts/sign/${token}/`, signatureData);
    },

    getPublic: async (token) => {
        const { data } = await api.get(`/contracts/sign/${token}/`);
        return data;
    }
};
