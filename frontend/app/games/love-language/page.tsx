'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const LOVE_LANGUAGE_QUESTIONS = [
    {
        id: 1,
        question: "What makes you feel most appreciated?",
        options: [
            { text: "When my partner helps me with my chores", language: "Acts of Service" },
            { text: "When my partner gives me a surprise gift", language: "Receiving Gifts" },
            { text: "When my partner tells me how much they love me", language: "Words of Affirmation" },
            { text: "When my partner spends quality time with me", language: "Quality Time" },
            { text: "When my partner gives me a long hug", language: "Physical Touch" }
        ]
    },
    {
        id: 2,
        question: "How do you prefer to show your love?",
        options: [
            { text: "By doing things for my partner", language: "Acts of Service" },
            { text: "By buying thoughtful presents", language: "Receiving Gifts" },
            { text: "By writing sweet notes or cards", language: "Words of Affirmation" },
            { text: "By planning special dates", language: "Quality Time" },
            { text: "By being physically affectionate", language: "Physical Touch" }
        ]
    },
    {
        id: 3,
        question: "What do you miss most when apart from your partner?",
        options: [
            { text: "Their help and support", language: "Acts of Service" },
            { text: "The tokens of love they give", language: "Receiving Gifts" },
            { text: "Our deep conversations", language: "Words of Affirmation" },
            { text: "Just being in their presence", language: "Quality Time" },
            { text: "Their touch and closeness", language: "Physical Touch" }
        ]
    },
    {
        id: 4,
        question: "What hurts you the most in a relationship?",
        options: [
            { text: "Broken commitments or laziness", language: "Acts of Service" },
            { text: "Missed birthdays or generic gifts", language: "Receiving Gifts" },
            { text: "Insults or lack of appreciation", language: "Words of Affirmation" },
            { text: "Distractions and lack of attention", language: "Quality Time" },
            { text: "Physical neglect or distance", language: "Physical Touch" }
        ]
    }
]

export default function LoveLanguagePage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<string[]>([])
    const [result, setResult] = useState<string | null>(null)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    const handleAnswer = (language: string) => {
        const newAnswers = [...answers, language]
        setAnswers(newAnswers)

        if (currentIndex < LOVE_LANGUAGE_QUESTIONS.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            calculateResult(newAnswers)
        }
    }

    const calculateResult = (finalAnswers: string[]) => {
        const counts: Record<string, number> = {}
        finalAnswers.forEach(lang => {
            counts[lang] = (counts[lang] || 0) + 1
        })

        const topLanguage = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
        setResult(topLanguage)
        toast.success('Test complete!')
    }

    if (authLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
            <button
                onClick={() => router.back()}
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Games
            </button>

            <div className="flex items-center gap-3 mb-12">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                    Love Language Test
                </h1>
            </div>

            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-pink-100 dark:border-gray-700"
                    >
                        <div className="mb-8">
                            <div className="flex justify-between text-sm text-gray-500 mb-2">
                                <span>Step {currentIndex + 1} of {LOVE_LANGUAGE_QUESTIONS.length}</span>
                                <span>{Math.round(((currentIndex + 1) / LOVE_LANGUAGE_QUESTIONS.length) * 100)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-rose-500 transition-all duration-500"
                                    style={{ width: `${((currentIndex + 1) / LOVE_LANGUAGE_QUESTIONS.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
                            {LOVE_LANGUAGE_QUESTIONS[currentIndex].question}
                        </h2>

                        <div className="space-y-4">
                            {LOVE_LANGUAGE_QUESTIONS[currentIndex].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option.language)}
                                    className="w-full p-4 text-left border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all font-medium text-gray-700 dark:text-gray-200"
                                >
                                    {option.text}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center border-4 border-rose-200 dark:border-gray-700"
                    >
                        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-12 h-12 text-rose-500" />
                        </div>
                        <h2 className="text-2xl text-gray-600 dark:text-gray-300 mb-2">Your Primary Love Language is</h2>
                        <div className="text-5xl font-black text-rose-600 mb-8 uppercase tracking-tighter">
                            {result}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-12 text-lg italic">
                            "Understanding how you give and receive love is the first step to a deeper connection."
                        </p>

                        <button
                            onClick={() => router.push('/games')}
                            className="px-12 py-4 bg-rose-500 text-white rounded-full font-bold text-lg hover:bg-rose-600 transition-shadow shadow-lg shadow-rose-200 dark:shadow-none"
                        >
                            Back to Games
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
