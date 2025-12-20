'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { ArrowLeft, RefreshCw, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function WouldYouRatherPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    const fetchQuestions = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/games/would-you-rather/questions`, {
                params: { mode: user?.modeDefault || 'love' },
            })
            // Shuffle questions
            const shuffled = (response.data.questions || []).sort(() => Math.random() - 0.5)
            setQuestions(shuffled)
            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch questions:', error)
            toast.error('Failed to load questions')
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchQuestions()
        }
    }, [user])

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            // Reshuffle and start over
            const shuffled = [...questions].sort(() => Math.random() - 0.5)
            setQuestions(shuffled)
            setCurrentIndex(0)
            toast.success('Restarting with shuffled questions!')
        }
    }

    if (authLoading || loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    const currentQ = questions[currentIndex]

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
            <button
                onClick={() => router.back()}
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Games
            </button>

            <div className="flex items-center gap-3 mb-12">
                <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-yellow-600 bg-clip-text text-transparent">
                    Would You Rather
                </h1>
            </div>

            <AnimatePresence mode="wait">
                {currentQ && (
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="w-full space-y-8"
                    >
                        <div className="text-center text-xl font-medium text-gray-600 dark:text-gray-400 mb-8">
                            {currentQ.question}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={nextQuestion}
                                className="group relative p-8 bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-xl transition-all overflow-hidden"
                            >
                                <div className="relative z-10 text-2xl font-bold text-white uppercase tracking-tight">
                                    {currentQ.options[0]}
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform">
                                    <span className="text-6xl font-black italic">OR</span>
                                </div>
                            </button>

                            <button
                                onClick={nextQuestion}
                                className="group relative p-8 bg-rose-500 hover:bg-rose-600 rounded-2xl shadow-xl transition-all overflow-hidden"
                            >
                                <div className="relative z-10 text-2xl font-bold text-white uppercase tracking-tight">
                                    {currentQ.options[1]}
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform">
                                    <span className="text-6xl font-black italic">OR</span>
                                </div>
                            </button>
                        </div>

                        <div className="flex justify-center pt-8">
                            <button
                                onClick={nextQuestion}
                                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" /> Skip this one
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!currentQ && !loading && (
                <div className="text-center space-y-4">
                    <p className="text-gray-600">No questions found for this mode.</p>
                    <button
                        onClick={fetchQuestions}
                        className="px-6 py-2 bg-pink-500 text-white rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    )
}
