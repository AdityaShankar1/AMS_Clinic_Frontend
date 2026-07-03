import axios from 'axios'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || '/api' 
})

// Attach the staff key header for Phase 1 auth
// Phase 2a JWT: replace this with Authorization: Bearer <token>
const STAFF_KEY = import.meta.env.VITE_STAFF_KEY || 'doctor-secret-change-this'

api.interceptors.request.use(cfg => {
  cfg.headers['X-Staff-Key'] = STAFF_KEY
  return cfg
})

export default api
