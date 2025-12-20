'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Heart, Users, AlertCircle, Sparkles } from 'lucide-react'

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
  const { register: registerUser, dummyRegister } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dummyLoading, setDummyLoading] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'love' | 'friends'>('love')
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [selectedMode])

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

  const handleDummyRegister = async () => {
    setDummyLoading(true)
    try {
      await dummyRegister(selectedMode)
    } catch (error) {
      // Error handled in useAuth
    } finally {
      setDummyLoading(false)
    }
  }

  const isLoveMode = selectedMode === 'love'

  return (
    <div className={`min-h-screen flex items-center justify-center py-8 px-4 transition-all duration-700 bg-gradient-to-br from-gray-900 to-gray-800`}>
      {/* Floating hearts for love mode */}
      {isLoveMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`absolute text-pink-300 opacity-20 text-6xl animate-pulse ${animate ? 'animate-float' : ''
                }`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 20}%`,
                animation: `float ${4 + i}s infinite ease-in-out`,
              }}
            >
              ❤️
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
      `}</style>

      <div className="max-w-lg w-full relative z-10">
        {/* Mode Selection Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => {
              setSelectedMode('love')
              setValue('modeDefault', 'love')
            }}
            className={`p-6 rounded-2xl border-3 transition-all duration-500 transform ${isLoveMode
              ? 'border-pink-500 bg-gradient-to-br from-pink-100 to-red-100 shadow-2xl scale-105'
              : 'border-gray-300 bg-white hover:border-pink-300'
              }`}
          >
            <div className={`text-4xl mb-3 transition-transform duration-500 ${isLoveMode ? 'scale-125 animate-pulse' : 'scale-100'}`}>
              ❤️
            </div>
            <div className={`font-bold transition-colors ${isLoveMode ? 'text-pink-600' : 'text-gray-500'}`}>
              Love Mode
            </div>
            <div className="text-xs text-gray-600 mt-1">Romantic connections</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedMode('friends')
              setValue('modeDefault', 'friends')
            }}
            className={`p-6 rounded-2xl border-3 transition-all duration-500 transform ${!isLoveMode
              ? 'border-indigo-500 bg-gradient-to-br from-blue-100 to-indigo-100 shadow-2xl scale-105'
              : 'border-gray-300 bg-white hover:border-indigo-300'
              }`}
          >
            <div className={`text-4xl mb-3 transition-transform duration-500 ${!isLoveMode ? 'scale-125 animate-bounce' : 'scale-100'}`}>
              👥
            </div>
            <div className={`font-bold transition-colors ${!isLoveMode ? 'text-indigo-600' : 'text-gray-500'}`}>
              Friends Mode
            </div>
            <div className="text-xs text-gray-600 mt-1">Platonic friendships</div>
          </button>
        </div>

        {/* Main Form Card */}
        <div className={`rounded-2xl shadow-2xl p-8 transition-all duration-700 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700`}>
          <div className="text-center mb-6">
            <div className={`text-5xl mb-3 ${isLoveMode ? 'animate-pulse' : 'animate-bounce'}`}>
              {isLoveMode ? '❤️' : '👥'}
            </div>
            <h2 className={`text-3xl font-bold mb-1 text-white`}>
              {isLoveMode ? 'Find Your Love' : 'Find Your Friends'}
            </h2>
            <p className="text-sm text-gray-300">
              {isLoveMode ? 'Build meaningful romantic connections' : 'Connect with amazing people'}
            </p>
          </div>

          {/* Warning Banner */}
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-2 bg-gray-800 border border-gray-700`}>
            <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 text-gray-300`} />
            <span className={`text-sm font-medium text-gray-300`}>
              Mode selection is permanent. You'll need to create a new account to change it.
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-2 transition-colors ${isLoveMode ? 'text-pink-400' : 'text-indigo-400'
                  }`}>
                  Full Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Your name"
                  className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all ${isLoveMode
                    ? 'border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 bg-gray-800 text-white'
                    : 'border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-white'
                    }`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.name.message}</p>}
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 transition-colors ${isLoveMode ? 'text-pink-600' : 'text-indigo-600'
                  }`}>
                  Date of Birth *
                </label>
                <input
                  {...register('dob')}
                  type="date"
                  className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all border-gray-700 bg-gray-800 text-white`}
                />
                {errors.dob && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.dob.message}</p>}
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-2 transition-colors ${isLoveMode ? 'text-pink-600' : 'text-indigo-600'
                }`}>
                📧 Email *
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all border-gray-700 bg-gray-800 text-white`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.email.message}</p>}
            </div>

            <div>
              <label className={`block text-xs font-bold mb-2 transition-colors ${isLoveMode ? 'text-pink-600' : 'text-indigo-600'
                }`}>
                📞 Phone Number *
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+1 (555) 000-0000"
                className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all border-gray-700 bg-gray-800 text-white`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-2 transition-colors ${isLoveMode ? 'text-pink-600' : 'text-indigo-600'
                  }`}>
                  🔐 Password *
                </label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Min 8 characters"
                  className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all border-gray-700 bg-gray-800 text-white`}
                />
                {errors.password && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.password.message}</p>}
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 transition-colors ${isLoveMode ? 'text-pink-600' : 'text-indigo-600'
                  }`}>
                  ✔️ Confirm *
                </label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Repeat password"
                  className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all border-gray-700 bg-gray-800 text-white`}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-2 transition-colors ${isLoveMode ? 'text-pink-600' : 'text-indigo-600'
                }`}>
                📍 Location (Optional)
              </label>
              <input
                {...register('location')}
                type="text"
                placeholder="City, State"
                className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all border-gray-700 bg-gray-800 text-white`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-2 transition-colors ${isLoveMode ? 'text-pink-600' : 'text-indigo-600'
                }`}>
                ✨ Bio (Optional)
              </label>
              <textarea
                {...register('bio')}
                rows={2}
                maxLength={500}
                placeholder={isLoveMode ? 'Share what makes you special...' : 'Tell us about yourself...'}
                className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all resize-none border-gray-700 bg-gray-800 text-white`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-2 transition-colors ${isLoveMode ? 'text-pink-600' : 'text-indigo-600'
                }`}>
                🎯 Interests (Optional)
              </label>
              <input
                {...register('interests')}
                type="text"
                placeholder={isLoveMode ? 'music, travel, romance' : 'music, games, sports'}
                className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all border-gray-700 bg-gray-800 text-white`}
              />
            </div>

            <input type="hidden" {...register('modeDefault')} value={selectedMode} />

            <button
              type="submit"
              disabled={loading || dummyLoading}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl bg-gradient-to-r from-pink-600 to-purple-600`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLoveMode ? '❤️' : '👥'} Create Account
                </span>
              )}
            </button>

            {/* Dummy Register Button */}
            <button
              type="button"
              onClick={handleDummyRegister}
              disabled={loading || dummyLoading}
              className="w-full py-3 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              {dummyLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating identity...
                </>
              ) : (
                <>✨ Quick Demo Register</>
              )}
            </button>

            <div className="relative py-4">
              <div className={`h-px ${isLoveMode ? 'bg-pink-200' : 'bg-indigo-200'}`}></div>
            </div>

            <p className="text-center text-sm text-gray-300">
              Already have an account?{' '}
              <Link href="/login" className={`font-bold text-white/90 hover:text-white`}>Sign in here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
