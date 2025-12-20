'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function PersonalityQuizPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quizId, setQuizId] = useState('')
  const [mode, setMode] = useState<'love' | 'friends' | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/api/personality/questions')
      setQuestions(response.data.questions)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast.error('Failed to load quiz questions')
      setLoading(false)
    }
  }

  const startQuiz = async (selectedMode: 'love' | 'friends') => {
    try {
      setMode(selectedMode)
      const response = await api.post('/api/personality/start', { mode: selectedMode })
      setQuizId(response.data.quizId)
      setAnswers([])
      setCurrentQuestion(0)
    } catch (error) {
      console.error('Error starting quiz:', error)
      toast.error('Failed to start quiz')
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

    // Move to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Submit quiz
      submitQuiz(newAnswers)
    }
  }

  const submitQuiz = async (finalAnswers: any[]) => {
    try {
      setLoading(true)
      const response = await api.post('/api/personality/submit', {
        quizId,
        answers: finalAnswers,
      })
      setResult(response.data.quiz)
      setSubmitted(true)
      toast.success('Quiz completed! Your personality type has been determined.')
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    } finally {
      setLoading(false)
    }
  }

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personality quiz...</p>
        </div>
      </div>
    )
  }

  // Mode selection
  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-red-50 p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">💝 Personality Quiz</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Discover your love or friendship personality type through 10 meaningful questions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => startQuiz('love')}
                className="p-8 border-2 border-pink-300 rounded-xl hover:bg-pink-50 transition-all hover:scale-105"
              >
                <div className="text-5xl mb-4">❤️</div>
                <h3 className="text-2xl font-bold text-pink-600 mb-2">Love Mode</h3>
                <p className="text-gray-600">Discover your romantic personality</p>
              </button>

              <button
                onClick={() => startQuiz('friends')}
                className="p-8 border-2 border-blue-300 rounded-xl hover:bg-blue-50 transition-all hover:scale-105"
              >
                <div className="text-5xl mb-4">💙</div>
                <h3 className="text-2xl font-bold text-blue-600 mb-2">Friends Mode</h3>
                <p className="text-gray-600">Discover your friendship personality</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quiz result
  if (submitted && result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-red-50 p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 Your Personality Type</h1>

            <div className="bg-gradient-to-r from-pink-100 to-red-100 rounded-xl p-8 my-8">
              <p className="text-6xl mb-4">{result.personalityType === 'The Free Spirit' ? '🦅' : '💕'}</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{result.personalityType}</h2>
              <p className="text-2xl text-pink-600 font-semibold">Score: {result.totalScore}/40</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Results</h3>
              <p className="text-gray-600 mb-4">Share this code with your {mode === 'love' ? 'lover' : 'friend'}:</p>
              <div className="bg-white border-2 border-pink-300 rounded-lg p-4 text-2xl font-bold text-pink-600 mb-4">
                {result.shareCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.shareCode)
                  toast.success('Share code copied!')
                }}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
              >
                📋 Copy Share Code
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Home
              </button>
              <button
                onClick={() => router.push(`/personality/share/${result.shareCode}`)}
                className="bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
              >
                📤 Share Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quiz in progress
  if (quizId && questions.length > 0) {
    const question = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4">
        <div className="max-w-2xl mx-auto">
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

          {/* Navigation */}
          {answers.length > currentQuestion && (
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                ← Previous
              </button>
              <button
                onClick={() => {
                  if (currentQuestion === questions.length - 1) {
                    submitQuiz(answers)
                  } else {
                    setCurrentQuestion(currentQuestion + 1)
                  }
                }}
                className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
              >
                {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
