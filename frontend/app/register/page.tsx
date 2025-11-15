'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Heart, Users, AlertCircle } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  dob: z.string().min(1, 'Date of birth is required'),
  modeDefault: z.enum(['love', 'friends']).default('love'),
  location: z.string().optional(),
  bio: z.string().max(500).optional(),
  interests: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'love' | 'friends'>('love')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      modeDefault: 'love',
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      const interests = data.interests ? data.interests.split(',').map(i => i.trim()) : []
      await registerUser({
        ...data,
        modeDefault: selectedMode,
        interests,
      })
    } catch (error) {
      // Error handled in useAuth
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-8 px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create your account
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose your mode - this cannot be changed later
            </p>
          </div>

          {/* Mode Selection - Prominent */}
          <div className="mb-6 p-4 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Select Mode * <span className="text-red-500">(Cannot be changed)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('love')
                  setValue('modeDefault', 'love')
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMode === 'love'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900 shadow-lg scale-105'
                    : 'border-gray-300 dark:border-gray-600 hover:border-pink-300'
                }`}
              >
                <Heart className={`w-6 h-6 mx-auto mb-2 ${selectedMode === 'love' ? 'text-pink-600' : 'text-gray-400'}`} />
                <div className="font-semibold text-sm text-gray-900 dark:text-white">Love Mode</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Romantic connections</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('friends')
                  setValue('modeDefault', 'friends')
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMode === 'friends'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 shadow-lg scale-105'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                }`}
              >
                <Users className={`w-6 h-6 mx-auto mb-2 ${selectedMode === 'friends' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="font-semibold text-sm text-gray-900 dark:text-white">Friends Mode</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Platonic friendships</div>
              </button>
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Mode selection is permanent. You'll need to create a new account to change it.</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date of Birth *
                </label>
                <input
                  {...register('dob')}
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.dob && <p className="mt-1 text-xs text-red-600">{errors.dob.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number *
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location (Optional)
              </label>
              <input
                {...register('location')}
                type="text"
                placeholder="City, State"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio (Optional)
              </label>
              <textarea
                {...register('bio')}
                rows={2}
                maxLength={500}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interests (Optional)
              </label>
              <input
                {...register('interests')}
                type="text"
                placeholder="music, travel, cooking"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <input type="hidden" {...register('modeDefault')} value={selectedMode} />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                selectedMode === 'love'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-xs text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-pink-600 dark:text-pink-400 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
