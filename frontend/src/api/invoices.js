import api from './axios';

export const invoicesApi = {
    list: async (params) => {
        const { data } = await api.get('/invoices/', { params });
        return data;
    },

    get: async (id) => {
        const { data } = await api.get(`/invoices/${id}/`);
        return data;
    },

    create: async (invoiceData) => {
        const { data } = await api.post('/invoices/', invoiceData);
        return data;
    },

    update: async (id, invoiceData) => {
        const { data } = await api.patch(`/invoices/${id}/`, invoiceData);
        return data;
    },

    delete: async (id) => {
        await api.delete(`/invoices/${id}/`);
    },

    send: async (id) => {
        await api.post(`/invoices/${id}/send/`);
    },

    createOrder: async (id) => {
        const { data } = await api.post(`/invoices/${id}/create-order/`);
        return data;
    },

    verifyPayment: async (id, paymentData) => {
        await api.post(`/invoices/${id}/verify-payment/`, paymentData);
    },

    downloadPdf: async (id) => {
        const { data } = await api.get(`/invoices/${id}/download_pdf/`, {
            responseType: 'blob'
        });
        return data;
    }
};
