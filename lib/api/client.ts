/**
 * API Client Configuration
 *
 * Axios instance configured for Xano Frontend API v2
 */

import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_XANO_BASE_URL || 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage or cookies
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      console.error('Unauthorized access - token may be expired')
    }
    return Promise.reject(error)
  }
)
