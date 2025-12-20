'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Heart } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, dummyLogin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [dummyLoading, setDummyLoading] = useState(false)

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
    } catch (error) {
      // Error handled in useAuth
    } finally {
      setLoading(false)
    }
  }

  const handleDummyLogin = async () => {
    setDummyLoading(true)
    try {
      await dummyLogin()
    } catch (error) {
      // Error handled in useAuth
    } finally {
      setDummyLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-pink-600 to-purple-600 p-3 rounded-full shadow">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Loves</h1>
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to continue your journey</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-3">
                📧 Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-5 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:bg-gray-800 transition-all duration-200 font-medium"
              />
              {errors.email && (
                <p className="mt-2 text-sm font-semibold text-red-500 flex items-center gap-1">
                  ❌ {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-3">
                🔐 Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-5 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:bg-gray-800 transition-all duration-200 font-medium"
              />
              {errors.password && (
                <p className="mt-2 text-sm font-semibold text-red-500 flex items-center gap-1">
                  ❌ {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || dummyLoading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </span>
              ) : (
                '💕 Sign In'
              )}
            </button>

            {/* Dummy Login Button */}
            <button
              type="button"
              onClick={handleDummyLogin}
              disabled={loading || dummyLoading}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 border border-white/10 flex items-center justify-center gap-2"
            >
              {dummyLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
                  Waking up demo user...
                </>
              ) : (
                <>🚀 Quick Demo Login</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-gray-900 text-gray-300 font-medium">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            href="/register"
            className="w-full block text-center bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200"
          >
            ✨ Create Account
          </Link>

          {/* Footer Info */}
          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="text-pink-400 hover:underline font-semibold">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="text-pink-400 hover:underline font-semibold">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Bottom Decoration */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 font-medium">🎉 Connect with love or friendship 💕</p>
        </div>
      </div>
    </div>
  )
}

