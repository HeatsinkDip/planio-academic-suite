import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    
    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// Tasks API
export const tasksAPI = {
    getAll: async () => {
        const response = await api.get('/tasks');
        return response.data;
    },
    
    create: async (taskData) => {
        const response = await api.post('/tasks', taskData);
        return response.data;
    },
    
    update: async (id, taskData) => {
        const response = await api.put(`/tasks/${id}`, taskData);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    },
};

// Transactions API
export const transactionsAPI = {
    getAll: async () => {
        const response = await api.get('/transactions');
        return response.data;
    },
    
    create: async (transactionData) => {
        const response = await api.post('/transactions', transactionData);
        return response.data;
    },
    
    update: async (id, transactionData) => {
        const response = await api.put(`/transactions/${id}`, transactionData);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/transactions/${id}`);
        return response.data;
    },
};

// Wallets API
export const walletsAPI = {
    getAll: async () => {
        const response = await api.get('/wallets');
        return response.data;
    },
    
    create: async (walletData) => {
        const response = await api.post('/wallets', walletData);
        return response.data;
    },
    
    update: async (id, walletData) => {
        const response = await api.put(`/wallets/${id}`, walletData);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/wallets/${id}`);
        return response.data;
    },
};

// Semester API
export const semesterAPI = {
    getConfig: async () => {
        const response = await api.get('/semester/config');
        return response.data;
    },
    
    updateConfig: async (configData) => {
        const response = await api.put('/semester/config', configData);
        return response.data;
    },
    
    getEvents: async () => {
        const response = await api.get('/semester/events');
        return response.data;
    },
    
    createEvent: async (eventData) => {
        const response = await api.post('/semester/events', eventData);
        return response.data;
    },
    
    deleteEvent: async (id) => {
        const response = await api.delete(`/semester/events/${id}`);
        return response.data;
    },
};

// Timetable API
export const timetableAPI = {
    getAll: async () => {
        const response = await api.get('/timetable');
        return response.data;
    },
    
    create: async (classData) => {
        const response = await api.post('/timetable', classData);
        return response.data;
    },
    
    update: async (id, classData) => {
        const response = await api.put(`/timetable/${id}`, classData);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/timetable/${id}`);
        return response.data;
    },
};

// Assignments API
export const assignmentsAPI = {
    getAll: async () => {
        const response = await api.get('/assignments');
        return response.data;
    },
    
    create: async (assignmentData) => {
        const response = await api.post('/assignments', assignmentData);
        return response.data;
    },
    
    update: async (id, assignmentData) => {
        const response = await api.put(`/assignments/${id}`, assignmentData);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/assignments/${id}`);
        return response.data;
    },
};

// Exams API
export const examsAPI = {
    getAll: async () => {
        const response = await api.get('/exams');
        return response.data;
    },
    
    create: async (examData) => {
        const response = await api.post('/exams', examData);
        return response.data;
    },
    
    update: async (id, examData) => {
        const response = await api.put(`/exams/${id}`, examData);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/exams/${id}`);
        return response.data;
    },
};

// Debts API
export const debtsAPI = {
    getAll: async () => {
        const response = await api.get('/debts');
        return response.data;
    },
    
    create: async (debtData) => {
        const response = await api.post('/debts', debtData);
        return response.data;
    },
    
    update: async (id, debtData) => {
        const response = await api.put(`/debts/${id}`, debtData);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/debts/${id}`);
        return response.data;
    },
};

// Notes API
export const notesAPI = {
    getAll: async () => {
        const response = await api.get('/notes');
        return response.data;
    },
    
    create: async (noteData) => {
        const response = await api.post('/notes', noteData);
        return response.data;
    },
    
    update: async (id, noteData) => {
        const response = await api.put(`/notes/${id}`, noteData);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/notes/${id}`);
        return response.data;
    },
};

// Shared Expenses API
export const sharedExpensesAPI = {
    getAll: async () => {
        const response = await api.get('/shared-expenses');
        return response.data;
    },
    
    create: async (expenseData) => {
        const response = await api.post('/shared-expenses', expenseData);
        return response.data;
    },
    
    update: async (id, expenseData) => {
        const response = await api.put(`/shared-expenses/${id}`, expenseData);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/shared-expenses/${id}`);
        return response.data;
    },
};

// Events API
export const eventsAPI = {
    getAll: async () => {
        const response = await api.get('/events');
        return response.data;
    },
    
    create: async (eventData) => {
        const response = await api.post('/events', eventData);
        return response.data;
    },
    
    update: async (id, eventData) => {
        const response = await api.put(`/events/${id}`, eventData);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    },
};

// Habits API
export const habitsAPI = {
    getAll: async () => {
        const response = await api.get('/habits');
        return response.data;
    },
    
    create: async (habitData) => {
        const response = await api.post('/habits', habitData);
        return response.data;
    },
    
    update: async (id, habitData) => {
        const response = await api.put(`/habits/${id}`, habitData);
        return response.data;
    },
    
    toggleToday: async (id) => {
        const response = await api.post(`/habits/${id}/toggle`);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/habits/${id}`);
        return response.data;
    },
};

export default api;
