import api from './client'

export const listAppointments = (params = {}) =>
  api.get('/appointments', { params }).then(r => r.data)

export const listDoctors = () =>
  api.get('/doctors').then(r => r.data)

export const listPatients = (q) =>
  api.get('/patients', { params: q ? { q } : {} }).then(r => r.data)

export const bookAppointment = (payload) =>
  api.post('/appointments', payload).then(r => r.data)

export const updateStatus = (id, status) =>
  api.put(`/appointments/${id}/status`, { status }).then(r => r.data)

export const updatePriority = (id, payload) =>
  api.put(`/appointments/${id}/priority`, payload).then(r => r.data)

export const reschedule = (id, new_scheduled_start) =>
  api.put(`/appointments/${id}/reschedule`, { new_scheduled_start }).then(r => r.data)

export const getHealth = () =>
  api.get('/health').then(r => r.data)
