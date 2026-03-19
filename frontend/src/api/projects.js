import api from './axios';

export const projectsApi = {
    list: async (params) => {
        const { data } = await api.get('/projects/', { params });
        return data;
    },

    get: async (id) => {
        const { data } = await api.get(`/projects/${id}/`);
        return data;
    },

    create: async (projectData) => {
        const { data } = await api.post('/projects/', projectData);
        return data;
    },

    update: async (id, projectData) => {
        const { data } = await api.patch(`/projects/${id}/`, projectData);
        return data;
    },

    delete: async (id) => {
        await api.delete(`/projects/${id}/`);
    },

    getTimeEntries: async (projectId) => {
        const { data } = await api.get(`/projects/${projectId}/time-entries/`);
        return data;
    },

    addTimeEntry: async (projectId, entry) => {
        const { data } = await api.post(`/projects/${projectId}/time-entries/`, entry);
        return data;
    }
};
