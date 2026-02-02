import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token refresh on 401 and other errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Network or server errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    // Handle different HTTP status codes
    switch (error.response.status) {
      case 401:
        // Unauthorized - token expired or invalid
        if (!originalRequest._retry) {
          originalRequest._retry = true
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          toast.error('Session expired. Please sign in again.')
        }
        break
      
      case 403:
        toast.error('Access denied. You do not have permission.')
        break
        
      case 404:
        // Don't show toast for 404s as they might be expected
        console.warn(`API endpoint not found: ${originalRequest.url}`)
        break
        
      case 429:
        toast.error('Too many requests. Please try again later.')
        break
        
      case 500:
        toast.error('Server error. Please try again later.')
        break
        
      default:
        // For other errors, show the server message if available
        const message = error.response.data?.message || 'An unexpected error occurred'
        toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default api

