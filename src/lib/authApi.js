import { api } from './api'

export const authApi = {
  registerStudent: (payload) => api.post('/auth/register/student', payload).then((r) => r.data.data),
  registerRecruiter: (payload) => api.post('/auth/register/recruiter', payload).then((r) => r.data.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
  changePassword: (payload) => api.put('/auth/change-password', payload).then((r) => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token, newPassword) =>
    api.post(`/auth/reset-password/${token}`, { newPassword }).then((r) => r.data),
}
