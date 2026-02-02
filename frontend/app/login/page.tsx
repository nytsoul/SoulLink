'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Heart, Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, dummyLogin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [dummyLoading, setDummyLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Welcome back! 🎉')
    } catch (error) {
      // Error already handled in useAuth hook
    } finally {
      setLoading(false)
    }
  }

  const handleDummyLogin = async () => {
    setDummyLoading(true)
    try {
      await dummyLogin()
      toast.success('Logged in with demo account! 🚀')
    } catch (error) {
      // Error already handled in useAuth hook
    } finally {
      setDummyLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-3 mb-6">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="p-3 bg-gradient-primary rounded-2xl shadow-glow-primary"
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </motion.div>
            <h1 className="text-3xl font-black gradient-text">SoulLink</h1>
          </div>
          
          <h2 className="text-4xl font-black text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-lg">Sign in to continue your journey</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-8 shadow-glass-lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-white">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-4 glass rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all ${
                    errors.email ? 'border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50' : ''
                  }`}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm font-medium"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-white">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-4 glass rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all ${
                    errors.password ? 'border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm font-medium"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-primary rounded-xl font-bold text-white hover:shadow-glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* Demo Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleDummyLogin}
              disabled={dummyLoading}
              className="w-full py-4 glass rounded-xl font-bold text-white hover:shadow-glass-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {dummyLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Loading Demo...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Try Demo Account</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center space-y-4"
        >
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="text-pink-400 hover:text-pink-300 font-bold transition-colors"
            >
              Create one now
            </Link>
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm">
            <Link 
              href="/forgot-password" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Forgot Password?
            </Link>
            <span className="text-gray-600">•</span>
            <Link 
              href="/help" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Need Help?
            </Link>
          </div>
          
          <div className="pt-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 glass rounded-full">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-gray-300">Secure & Private Login</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
