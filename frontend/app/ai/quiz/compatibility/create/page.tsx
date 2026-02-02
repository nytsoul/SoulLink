'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import axios from 'axios'
import { Loader2, Copy, CheckCircle2, ArrowRight, Plus, Trash2, Sparkles, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function CreateCompatibilityQuiz() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [mode, setMode] = useState<'choose' | 'manual' | 'ai'>('choose')
    const [loading, setLoading] = useState(false)
    const [quiz, setQuiz] = useState<any>(null)
    const [answers, setAnswers] = useState<Record<number, any>>({})
    const [currentIndex, setCurrentIndex] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [shareCode, setShareCode] = useState<string | null>(null)

    // Manual question creation
    const [manualQuestions, setManualQuestions] = useState<any[]>([
        { question: '', type: 'text' }
    ])

    useEffect(() => {
        if (!authLoading && !user) router.push('/login')
    }, [user, authLoading, router])

    const addQuestion = () => {
        if (manualQuestions.length < 15) {
            setManualQuestions([...manualQuestions, { question: '', type: 'text' }])
        }
    }

    const removeQuestion = (index: number) => {
        if (manualQuestions.length > 1) {
            setManualQuestions(manualQuestions.filter((_, i) => i !== index))
        }
    }

    const updateQuestion = (index: number, field: string, value: any) => {
        const updated = [...manualQuestions]
        updated[index] = { ...updated[index], [field]: value }
        setManualQuestions(updated)
    }

    const createManualQuiz = async () => {
        // Validate
        const validQuestions = manualQuestions.filter(q => q.question.trim().length > 0)
        if (validQuestions.length === 0) {
            toast.error('Please add at least one question')
            return
        }

        setLoading(true)
        try {
            // Create quiz with manual questions
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/quiz/create-compatibility-manual`, {
                mode: user?.modeDefault || 'love',
                questions: validQuestions,
            })
            setQuiz(response.data.quiz)
            setMode('manual')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create quiz')
        } finally {
            setLoading(false)
        }
    }

    const generateQuiz = async () => {
        setLoading(true)
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/quiz/create-compatibility`, {
                mode: user?.modeDefault || 'love',
            })
            setQuiz(response.data.quiz)
            setMode('ai')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate quiz')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/quiz/submit-creator`, {
                quizId: quiz._id,
                answers,
            })
            setShareCode(response.data.code)
            toast.success('Quiz created successfully!')
        } catch (error: any) {
            toast.error('Failed to save answers')
        } finally {
            setSubmitting(false)
        }
    }

    const copyCode = () => {
        if (shareCode) {
            navigator.clipboard.writeText(shareCode)
            toast.success('Code copied to clipboard!')
        }
    }

    if (authLoading || !user) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {mode === 'choose' && !quiz ? (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Create Your Quiz</h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300">Choose how you want to create your compatibility quiz</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Manual Mode */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-purple-200 dark:border-purple-800">
                                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <Plus className="w-8 h-8 text-purple-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">Create Manually</h2>
                                <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                                    Write your own questions like "Date of birth", "How many relationships?", etc.
                                </p>
                                <button
                                    onClick={() => setMode('manual')}
                                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                                >
                                    Start Creating
                                </button>
                            </div>

                            {/* AI Mode */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-rose-200 dark:border-rose-800">
                                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <Sparkles className="w-8 h-8 text-rose-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">AI Generated</h2>
                                <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                                    Let AI create 15 unique compatibility questions for you automatically.
                                </p>
                                <button
                                    onClick={generateQuiz}
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {loading ? <><Loader2 className="animate-spin inline mr-2" /> Generating...</> : 'Generate with AI'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : mode === 'manual' && !quiz ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Create Your Questions</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            Add questions that you and your partner will answer. Examples: "What's your date of birth?", "How many relationships have you had?", "Favorite color?"
                        </p>

                        <div className="space-y-4 mb-8">
                            {manualQuestions.map((q, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder={`Question ${idx + 1} (e.g., What's your date of birth?)`}
                                            value={q.question}
                                            onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    {manualQuestions.length > 1 && (
                                        <button
                                            onClick={() => removeQuestion(idx)}
                                            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            {manualQuestions.length < 15 && (
                                <button
                                    onClick={addQuestion}
                                    className="flex-1 py-3 border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add Question ({manualQuestions.length}/15)
                                </button>
                            )}
                            <button
                                onClick={createManualQuiz}
                                disabled={loading || manualQuestions.filter(q => q.question.trim()).length === 0}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? <><Loader2 className="animate-spin inline mr-2" /> Creating...</> : 'Create Quiz'}
                            </button>
                        </div>
                    </div>
                ) : shareCode ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl text-center border border-rose-100 dark:border-gray-700"
                    >
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Quiz Ready!</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            Share this code with your partner/friend to compare your answers.
                        </p>

                        <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-6 mb-8 flex items-center justify-between max-w-sm mx-auto border-2 border-dashed border-gray-300 dark:border-gray-700">
                            <span className="text-4xl font-mono font-bold tracking-widest text-gray-800 dark:text-white">{shareCode}</span>
                            <button onClick={copyCode} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                <Copy className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-8 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </motion.div>
                ) : (
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700">
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
                                    {submitting ? <><Loader2 className="animate-spin w-4 h-4" /> Saving...</> : 'Finish & Get Code'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
