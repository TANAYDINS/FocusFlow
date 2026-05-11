import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskApi = {
  getTasks: () => apiClient.get('/tasks/'),
  createTask: (data: any) => apiClient.post('/tasks/create', data),
  createTasksBulk: (data: any[]) => apiClient.post('/tasks/bulk', data),
  updateTask: (id: number, data: any) => apiClient.patch(`/tasks/${id}`, data),
  deleteTask: (id: number) => apiClient.delete(`/tasks/${id}`),
};

export const aiApi = {
  analyzeText: (text: string, current_time?: string) => apiClient.post('/ai/analyze', { text, current_time }),
  getDailyPlan: () => apiClient.post('/ai/daily-plan'),
  chat: (message: string, history: { role: string; content: string }[]) =>
    apiClient.post('/ai/chat', { message, history }),
};

export const scheduleApi = {
  getSchedule: () => apiClient.get('/schedule/'),
  generateSchedule: () => apiClient.post('/schedule/generate'),
};

export const dashboardApi = {
  getBriefing: () => apiClient.get('/briefing/today'),
  getAnalytics: () => apiClient.get('/analytics/'),
  getPriorityTasks: () => apiClient.get('/tasks/priority'),
};


export const settingsApi = {
  getSettings: () => apiClient.get('/settings/'),
  updateSettings: (data: { auto_schedule?: boolean }) =>
    apiClient.put('/settings/', data),
  getTelegramStatus: () => apiClient.get('/settings/telegram/status'),
  disconnectTelegram: () => apiClient.post('/settings/telegram/disconnect'),
  sendTasksToTelegram: () => apiClient.post('/settings/telegram/send-tasks'),
  getTelegramUsers: () => apiClient.get('/settings/telegram/users'),
  removeTelegramUser: (chatId: string) => apiClient.delete(`/settings/telegram/users/${chatId}`),
};

export default apiClient;
