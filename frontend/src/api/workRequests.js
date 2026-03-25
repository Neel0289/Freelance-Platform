import axios from './axios';

export const workRequestsApi = {
    list: () => axios.get('/projects/work-requests/').then(res => res.data),
    get: (id) => axios.get(`/projects/work-requests/${id}/`).then(res => res.data),
    create: (data) => axios.post('/projects/work-requests/', data).then(res => res.data),
    accept: (id, data) => axios.post(`/projects/work-requests/${id}/accept/`, data).then(res => res.data),
    clientAccept: (id) => axios.post(`/projects/work-requests/${id}/client_accept/`).then(res => res.data),
    decline: (id) => axios.post(`/projects/work-requests/${id}/decline/`).then(res => res.data),
};
