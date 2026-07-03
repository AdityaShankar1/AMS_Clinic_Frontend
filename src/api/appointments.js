import api from './client'

const prefix = import.meta.env.DEV ? '/api' : ''

export const listAppointments = (params = {}) =>
  api.get(`${prefix}/appointments`, { params }).then(r => r.data)

export const listDoctors = () =>
  api.get(`${prefix}/doctors`).then(r => r.data)

export const listPatients = (q) =>
  api.get(`${prefix}/patients`, { params: q ? { q } : {} }).then(r => r.data)

export const bookAppointment = (payload) =>
  api.post(`${prefix}/appointments`, payload).then(r => r.data)

export const updateStatus = (id, status) =>
  api.put(`${prefix}/appointments/${id}/status`, { status }).then(r => r.data)

export const updatePriority = (id, payload) =>
  api.put(`${prefix}/appointments/${id}/priority`, payload).then(r => r.data)

export const reschedule = (id, new_scheduled_start) =>
  api.put(`${prefix}/appointments/${id}/reschedule`, { new_scheduled_start }).then(r => r.data)

export const getHealth = () =>
  api.get(`${prefix}/health`).then(r => r.data)
