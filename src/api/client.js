import axios from 'axios'

// In dev: empty base so Vite proxy handles /api/* → localhost:8001
// In prod: VITE_API_BASE points to deployed FastAPI, no /api prefix needed
const isDev = import.meta.env.DEV
const BASE = isDev ? '' : (import.meta.env.VITE_API_BASE || '')

const api = axios.create({ baseURL: BASE })

const STAFF_KEY = import.meta.env.VITE_STAFF_KEY || 'doctor-secret-change-this'

api.interceptors.request.use(cfg => {
  cfg.headers['X-Staff-Key'] = STAFF_KEY
  return cfg
})

export default api
