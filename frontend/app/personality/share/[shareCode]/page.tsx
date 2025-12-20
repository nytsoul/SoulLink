'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Question {
  id: number
  question: string
  options: Array<{
    text: string
    emoji: string
    score: number
  }>
}

export default function SharedQuizPage() {
  const router = useRouter()
  const params = useParams()
  const shareCode = params.shareCode as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [sharedBy, setSharedBy] = useState<any>(null)
  const [originalQuizId, setOriginalQuizId] = useState('')

  useEffect(() => {
    fetchSharedQuiz()
  }, [shareCode])

  const fetchSharedQuiz = async () => {
    try {
      const response = await api.get(`/api/personality/share/${shareCode}`)
      setQuestions(response.data.quiz.questions)
      setSharedBy(response.data.quiz.sharedBy)
      setOriginalQuizId(response.data.quiz.id)
      setAnswers(new Array(response.data.quiz.questions.length).fill(null))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching shared quiz:', error)
      toast.error('Failed to load shared quiz')
      setLoading(false)
    }
  }

  const handleAnswer = (selectedOption: string, emoji: string, score: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion].id,
      selectedOption,
      emoji,
      score,
    }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitQuiz(newAnswers)
    }
  }

  const submitQuiz = async (finalAnswers: any[]) => {
    try {
      setLoading(true)
      const response = await api.post('/api/personality/submit-shared', {
        originalQuizId,
        answers: finalAnswers,
      })
      setResult(response.data)
      setSubmitted(true)
      toast.success('Quiz completed!')
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared quiz...</p>
        </div>
      </div>
    )
  }

  // Result page with compatibility
  if (submitted && result) {
    const compatibilityColor =
      result.compatibility.score > 80
        ? 'text-green-600'
        : result.compatibility.score > 60
          ? 'text-blue-600'
          : result.compatibility.score > 40
            ? 'text-yellow-600'
            : 'text-red-600'

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-red-50 p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">💫 Compatibility Results</h1>

            {/* Personality Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Their personality */}
              <div className="bg-pink-50 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Their Personality</p>
                <div className="text-5xl mb-3">💕</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {result.originalUserPersonality.type}
                </h3>
                <p className="text-pink-600 font-semibold">Score: {result.originalUserPersonality.score}/40</p>
              </div>

              {/* Your personality */}
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Your Personality</p>
                <div className="text-5xl mb-3">💙</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{result.myPersonality.type}</h3>
                <p className="text-blue-600 font-semibold">Score: {result.myPersonality.score}/40</p>
              </div>
            </div>

            {/* Compatibility Score */}
            <div className="bg-gradient-to-r from-pink-100 to-red-100 rounded-xl p-8 text-center mb-8">
              <p className="text-sm text-gray-600 mb-2 font-semibold">Compatibility Score</p>
              <div className={`text-6xl font-bold mb-4 ${compatibilityColor}`}>
                {result.compatibility.score}%
              </div>
              <p className="text-2xl font-semibold text-gray-900">{result.compatibility.message}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Home
              </button>
              <button
                onClick={() => router.push('/chat')}
                className="bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
              >
                💬 Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quiz page
  if (questions.length > 0) {
    const question = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header with sharer info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <p className="text-center text-gray-600">
              <span className="font-semibold">{sharedBy?.name}</span> sent you a personality quiz!
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-pink-600 font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-600 to-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{question.question}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.text, option.emoji, option.score)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-pink-600 hover:bg-pink-50 transition-all transform hover:scale-105 text-center"
                >
                  <div className="text-4xl mb-3">{option.emoji}</div>
                  <p className="font-semibold text-gray-900">{option.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
