import { api } from './api'

export const drivesApi = {
  list: (params) => api.get('/drives', { params }).then((r) => r.data),
  get: (id) => api.get(`/drives/${id}`).then((r) => r.data.data),
  analytics: (id) => api.get(`/drives/${id}/analytics`).then((r) => r.data.data),
  create: (payload) => api.post('/drives', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/drives/${id}`, payload).then((r) => r.data.data),
  updateStatus: (id, status) => api.patch(`/drives/${id}/status`, { status }).then((r) => r.data.data),
  remove: (id) => api.delete(`/drives/${id}`).then((r) => r.data),
}

export const applicationsApi = {
  // Always sent as multipart so an optional drive-specific resume can ride along.
  apply: (driveId, formData) =>
    api
      .post(`/applications/${driveId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data),
  mine: (params) => api.get('/applications/me', { params }).then((r) => r.data),
  withdraw: (id) => api.delete(`/applications/${id}`).then((r) => r.data),
  forDrive: (driveId, params) => api.get(`/applications/drive/${driveId}`, { params }).then((r) => r.data),
  updateStatus: (id, payload) => api.put(`/applications/${id}/status`, payload).then((r) => r.data.data),
  updateMeta: (id, payload) => api.put(`/applications/${id}/meta`, payload).then((r) => r.data.data),
  // Downloads go through axios (not a plain <a href>) so the auth header
  // actually gets attached — a raw link to a protected route would 401.
  exportDownload: async (driveId, suggestedName = 'applicants.xlsx') => {
    const res = await api.get(`/applications/drive/${driveId}/export`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', suggestedName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
  emailExport: (driveId, email) =>
    api.post(`/applications/drive/${driveId}/export-email`, { email }).then((r) => r.data),
}

export const studentsApi = {
  me: () => api.get('/students/me').then((r) => r.data.data),
  updateMe: (formData) =>
    api
      .put('/students/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data),
  list: (params) => api.get('/students', { params }).then((r) => r.data),
  get: (id) => api.get(`/students/${id}`).then((r) => r.data.data),
  getApplications: (id) => api.get(`/students/${id}/applications`).then((r) => r.data.data),
  updatePlacementStatus: (id, payload) =>
    api.put(`/students/${id}/placement-status`, payload).then((r) => r.data.data),
  sendNocReminder: (id) => api.post(`/students/${id}/send-noc-reminder`).then((r) => r.data),
  remove: (id) => api.delete(`/students/${id}`).then((r) => r.data),
}

export const recruitersApi = {
  me: () => api.get('/recruiters/me').then((r) => r.data.data),
  updateMe: (formData) =>
    api
      .put('/recruiters/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data),
  list: (params) => api.get('/recruiters', { params }).then((r) => r.data),
  get: (id) => api.get(`/recruiters/${id}`).then((r) => r.data.data),
  approve: (id) => api.put(`/recruiters/${id}/approve`).then((r) => r.data.data),
  reject: (id, reason) => api.put(`/recruiters/${id}/reject`, { reason }).then((r) => r.data.data),
  remove: (id) => api.delete(`/recruiters/${id}`).then((r) => r.data),
}

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard').then((r) => r.data.data),
  me: () => api.get('/admin/me').then((r) => r.data.data),
  updateMe: (payload) => api.put('/admin/me', payload).then((r) => r.data.data),
  listAdmins: (params) => api.get('/admin/admins', { params }).then((r) => r.data),
  createAdmin: (payload) => api.post('/admin/admins', payload).then((r) => r.data.data),
}

export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }).then((r) => r.data),
  markRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data.data),
  markAllRead: () => api.put('/notifications/read-all').then((r) => r.data),
}
