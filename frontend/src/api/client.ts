import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskApi = {
  getTasks: () => apiClient.get('/tasks/'),
  createTask: (data: any) => apiClient.post('/tasks/create', data),
};

export const aiApi = {
  analyzeText: (text: string) => apiClient.post('/ai/analyze', { text }),
};

export const scheduleApi = {
  generateSchedule: () => apiClient.post('/schedule/generate'),
};

export const dashboardApi = {
  getBriefing: () => apiClient.get('/briefing/today'),
  getAnalytics: () => apiClient.get('/analytics/'),
};

export default apiClient;
