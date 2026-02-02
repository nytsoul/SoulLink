'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import axios from 'axios'
import { Loader2, Heart, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CompatibilityResult({ params }: { params: { id: string } }) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [quiz, setQuiz] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) router.push('/login')
    }, [user, authLoading, router])

    const fetchQuizResult = useCallback(async () => {
        try {
            // This endpoint doesn't exist yet, I will add it.
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/quiz/${params.id}`)
            setQuiz(response.data.quiz)
        } catch (error) {
            // Fallback if endpoint missing
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        if (user && params.id) {
            fetchQuizResult()
        }
    }, [user, params.id, fetchQuizResult])

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>

    // Fallback if we couldn't fetch (e.g. endpoint not added yet)
    const score = quiz?.score ?? 0
    const mode = quiz?.mode ?? 'love'

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-3xl mx-auto text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-12 border border-white/20 dark:border-gray-700"
                >
                    <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">
                        {mode === 'love' ? 'Love' : 'Friendship'} Compatibility
                    </h1>

                    <div className="relative w-64 h-64 mx-auto mb-12">
                        {/* Meter Background */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="128"
                                cy="128"
                                r="120"
                                stroke="currentColor"
                                strokeWidth="20"
                                fill="transparent"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            <motion.circle
                                initial={{ strokeDasharray: "0 1000" }}
                                animate={{ strokeDasharray: `${(score / 100) * 754} 1000` }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                cx="128"
                                cy="128"
                                r="120"
                                stroke="currentColor"
                                strokeWidth="20"
                                fill="transparent"
                                strokeLinecap="round"
                                className={mode === 'love' ? "text-rose-500" : "text-purple-500"}
                                style={{ strokeDashoffset: 0 }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-6xl font-bold text-gray-800 dark:text-white">{score}%</span>
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Match</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                            {score >= 80 ? "It's a Perfect Match! 💘" :
                                score >= 60 ? "Great Compatibility! 💖" :
                                    score >= 40 ? "Good Potential! 💗" :
                                        "Room to Grow! 🌱"}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                            {score >= 80 ? "You two are incredibly in sync. Your values and preferences align perfectly!" :
                                score >= 60 ? "You have a strong connection with many shared interests and values." :
                                    "You have some differences, but that's what makes relationships interesting!"}
                        </p>
                    </div>

                    <div className="mt-12 flex justify-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-8 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                        <button className="px-8 py-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 rounded-xl font-semibold hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-2">
                            <Share2 className="w-5 h-5" /> Share Result
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
