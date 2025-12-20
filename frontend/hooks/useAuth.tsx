'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  modeDefault: 'love' | 'friends'
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  setMode: (mode: 'love' | 'friends') => Promise<void>
  dummyLogin: () => Promise<void>
  dummyRegister: (mode: 'love' | 'friends') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`)
      setUser(response.data.user)
    } catch (error) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email,
        password,
      })
      localStorage.setItem('token', response.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      setUser(response.data.user)
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    }
  }

  const register = async (data: any) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, data)
      localStorage.setItem('token', response.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      setUser(response.data.user)
      toast.success('Registration successful! Please verify your email and phone.')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    router.push('/')
    toast.success('Logged out successfully')
  }

  const setMode = async (mode: 'love' | 'friends') => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/mode`, { mode })
      if (user) {
        setUser({ ...user, modeDefault: mode })
      }
      toast.success(`Switched to ${mode} mode`)
    } catch (error: any) {
      if (error.response?.data?.modeLocked) {
        toast.error('Mode is locked. Please logout and create a new account to change mode.', {
          duration: 5000,
        })
      } else {
        toast.error(error.response?.data?.message || 'Failed to change mode')
      }
    }
  }

  const dummyLogin = async () => {
    try {
      return await login('demo@example.com', 'password123')
    } catch (error) {
      console.log('Demo login failed, trying demo register instead...')
      return await dummyRegister('love')
    }
  }

  const dummyRegister = async (mode: 'love' | 'friends') => {
    const randomSuffix = Math.floor(Math.random() * 10000)
    const data = {
      name: `Demo User ${randomSuffix}`,
      email: `demo${randomSuffix}@example.com`,
      phone: `+1555${randomSuffix.toString().padStart(4, '0')}00`,
      password: 'password123',
      dob: '1995-01-01',
      modeDefault: mode,
    }
    return register(data)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setMode, dummyLogin, dummyRegister }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

