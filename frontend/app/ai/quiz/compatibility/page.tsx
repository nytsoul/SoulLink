'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Users, ArrowRight } from 'lucide-react'

export default function CompatibilityPage() {
    const router = useRouter()
    const [code, setCode] = useState('')

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault()
        if (code.trim().length === 6) {
            router.push(`/ai/quiz/compatibility/join/${code.toUpperCase()}`)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
                    Compatibility Quiz
                </h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Create Quiz */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-rose-100 dark:border-gray-700 hover:scale-105 transition-transform duration-300">
                        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <Heart className="w-8 h-8 text-rose-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">Create Quiz</h2>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
                            Generate a unique quiz, answer the questions, and share the code with your partner or friend.
                        </p>
                        <button
                            onClick={() => router.push('/ai/quiz/compatibility/create')}
                            className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                        >
                            Create New Quiz
                        </button>
                    </div>

                    {/* Join Quiz */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100 dark:border-gray-700 hover:scale-105 transition-transform duration-300">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <Users className="w-8 h-8 text-purple-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">Join Quiz</h2>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
                            Have a code? Enter it below to take the quiz and see your compatibility score.
                        </p>
                        <form onSubmit={handleJoin} className="space-y-4">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="ENTER CODE (e.g. A1B2C3)"
                                maxLength={6}
                                className="w-full px-4 py-4 text-center text-2xl tracking-widest uppercase rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 outline-none transition-all"
                            />
                            <button
                                type="submit"
                                disabled={code.length !== 6}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Join Quiz <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
