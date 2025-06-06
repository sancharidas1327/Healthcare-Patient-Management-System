import axios from 'axios';

const API_URL = 'http://localhost:5000/api/patients'; 
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user')); 
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

const patientService = {
    getAllPatients: (page = 1, limit = 10, sort = 'name.lastName', order = 'asc') => {
        return axios.get(`${API_URL}?page=${page}&limit=${limit}&sort=${sort}&order=${order}`, { headers: getAuthHeader() });
    },
    searchPatients: (params) => {
        return axios.get(`${API_URL}/search`, { params, headers: getAuthHeader() });
    },
    getPatientById: (id) => {
        return axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
    },
    addPatient: (patientData) => {
        return axios.post(API_URL, patientData, { headers: getAuthHeader() });
    },
    updatePatient: (id, patientData) => {
        return axios.put(`${API_URL}/${id}`, patientData, { headers: getAuthHeader() });
    },
    deletePatient: (id) => {
        return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    },
    getAnalytics: () => {
        return axios.get(`${API_URL}/analytics`, { headers: getAuthHeader() });
    }
};

export default patientService;
