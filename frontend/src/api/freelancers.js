import axios from './axios';

export const freelancersApi = {
    list: (params) => axios.get('/auth/freelancers/', { params }).then(res => res.data),
    get: (id) => axios.get(`/auth/freelancers/${id}/`).then(res => res.data),
};
