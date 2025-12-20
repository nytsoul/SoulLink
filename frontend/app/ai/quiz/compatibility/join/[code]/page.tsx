'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import axios from 'axios'
import { Loader2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function JoinCompatibilityQuiz({ params }: { params: { code: string } }) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [quiz, setQuiz] = useState<any>(null)
    const [answers, setAnswers] = useState<Record<number, any>>({})
    const [currentIndex, setCurrentIndex] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) router.push('/login')
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && params.code) {
            fetchQuiz()
        }
    }, [user, params.code])

    const fetchQuiz = async () => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/quiz/join`, {
                code: params.code,
            })
            setQuiz(response.data.quiz)
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to join quiz')
            router.push('/ai/quiz/compatibility')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/quiz/submit-taker`, {
                quizId: quiz._id,
                answers,
            })
            router.push(`/ai/quiz/compatibility/result/${quiz._id}`)
        } catch (error: any) {
            toast.error('Failed to submit answers')
        } finally {
            setSubmitting(false)
        }
    }

    if (authLoading || loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>

    if (!quiz) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
                        Compatibility Quiz
                    </h1>

                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <span>Question {currentIndex + 1}</span>
                            <span>{quiz.questions.length} Total</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
                                className="h-full bg-gradient-to-r from-rose-500 to-purple-600 rounded-full"
                            />
                        </div>
                    </div>

                    <div className="relative min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ rotateY: 90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -90, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="p-8 border border-rose-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-lg"
                            >
                                <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white leading-relaxed">
                                    {currentIndex + 1}. {quiz.questions[currentIndex].question}
                                </h3>

                                {quiz.questions[currentIndex].type === 'multiple-choice' && quiz.questions[currentIndex].options && (
                                    <div className="space-y-3">
                                        {quiz.questions[currentIndex].options.map((option: string, optIdx: number) => (
                                            <label key={optIdx} className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border-2 ${answers[currentIndex] === option ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                <input
                                                    type="radio"
                                                    name={`question-${currentIndex}`}
                                                    value={option}
                                                    checked={answers[currentIndex] === option}
                                                    onChange={(e) => setAnswers({ ...answers, [currentIndex]: e.target.value })}
                                                    className="w-5 h-5 text-rose-600 focus:ring-rose-500 border-gray-300"
                                                />
                                                <span className="ml-3 text-gray-700 dark:text-gray-200 font-medium">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {quiz.questions[currentIndex].type === 'scale' && (
                                    <div className="flex justify-between gap-2 mt-8">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setAnswers({ ...answers, [currentIndex]: num })}
                                                className={`w-12 h-12 rounded-full font-bold text-lg transition-all ${answers[currentIndex] === num ? 'bg-rose-500 text-white scale-110 shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {quiz.questions[currentIndex].type === 'text' && (
                                    <div className="mt-4">
                                        <input
                                            type="text"
                                            placeholder="Type your answer..."
                                            value={answers[currentIndex] || ''}
                                            onChange={(e) => setAnswers({ ...answers, [currentIndex]: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        <button
                            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                            disabled={currentIndex === 0}
                            className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Back
                        </button>

                        {currentIndex < quiz.questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentIndex((i) => Math.min(quiz.questions.length - 1, i + 1))}
                                className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-lg shadow-rose-500/30"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-medium disabled:opacity-50 hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                            >
                                {submitting ? <><Loader2 className="animate-spin w-4 h-4" /> Submitting...</> : 'See Results'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
