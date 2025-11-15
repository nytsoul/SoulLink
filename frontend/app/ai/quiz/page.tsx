'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QuizPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const generateQuiz = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/quiz`, {
        mode: user?.modeDefault || 'love',
        count: 25,
      })
      setQuiz(response.data.quiz)
      setAnswers({})
      setSubmitted(false)
      toast.success('Quiz generated!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
    toast.success('Quiz submitted!')
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {user.modeDefault === 'love' ? 'Love' : 'Friendship'} Compatibility Quiz
        </h1>

        {!quiz ? (
          <div className="text-center py-12">
            <button
              onClick={generateQuiz}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 flex items-center gap-2 mx-auto font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                'Generate Quiz'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {quiz.questions?.map((question: any, idx: number) => (
              <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                  {idx + 1}. {question.question}
                </h3>
                {question.type === 'multiple-choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option: string, optIdx: number) => (
                      <label
                        key={optIdx}
                        className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={option}
                          onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                          className="mr-2"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                {question.type === 'scale' && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setAnswers({ ...answers, [idx]: num })}
                        className={`px-4 py-2 rounded ${
                          answers[idx] === num
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 font-semibold"
            >
              {submitted ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Submitted!
                </span>
              ) : (
                'Submit Quiz'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

