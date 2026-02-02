'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Suspense } from 'react'

function QuizContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const generateQuiz = async () => {
    setLoading(true)
    try {
      const selectedMode = searchParams?.get('mode') || user?.modeDefault || 'love'
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/quiz`, {
        mode: selectedMode,
        count: 15,
      })
      setQuiz(response.data.quiz)
      setAnswers({})
      setCurrentIndex(0)
      setSubmitted(false)
      setScore(null)
      toast.success('Quiz generated!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // Calculate score based on answers
      const totalQuestions = quiz.questions?.length || 1
      const answeredCount = Object.values(answers).filter((answer) => {
        if (answer === undefined || answer === null) return false
        if (typeof answer === 'string') return answer.trim().length > 0
        return true
      }).length
      const calculatedScore = Math.round((answeredCount / totalQuestions) * 100)

      setScore(calculatedScore)
      setSubmitted(true)
      toast.success(`Quiz submitted! Your score: ${calculatedScore}%`)

      // Save score to backend (optional)
      try {
        const selectedMode = searchParams?.get('mode') || user?.modeDefault || 'love'
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/quiz/score`, {
          score: calculatedScore,
          mode: selectedMode,
        })
      } catch (err) {
        // Score endpoint may not exist, ignore
      }

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
          {(searchParams?.get('mode') || user.modeDefault) === 'love' ? 'Love' : 'Friendship'} Compatibility Quiz
        </h1>

        {submitted && score !== null ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-purple-600">
              {score}%
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Great Job!</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {score >= 80 && 'Excellent compatibility score!'}
              {score >= 60 && score < 80 && 'Good compatibility score!'}
              {score >= 40 && score < 60 && 'Average compatibility score.'}
              {score < 40 && 'Room for improvement!'}
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard in 3 seconds...</p>
          </motion.div>
        ) : !quiz ? (
          <div className="text-center py-12">
            <button
              onClick={generateQuiz}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 mx-auto font-bold text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                'Start Quiz'
              )}
            </button>
          </div>
        ) : (
          <div>
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
                {quiz.questions && quiz.questions[currentIndex] && (
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
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
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
                  {submitting ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>
                  ) : (
                    'Finish Quiz'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading quiz...</div>}>
      <QuizContent />
    </Suspense>
  )
}

