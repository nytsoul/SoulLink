'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Users, Flame, Shuffle, ArrowLeft, Settings, Volume2, VolumeX, UserPlus, Trash2, Play } from 'lucide-react'
import Link from 'next/link'

type Category = 'general' | 'love' | 'friendship' | 'spicy' | 'funny' | 'deep'
type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme'

interface Question {
  type: 'truth' | 'dare'
  text: string
  category: Category
  difficulty: Difficulty
}

interface Player {
  id: string
  name: string
}

const truthQuestions: Question[] = [
  // General
  { type: 'truth', text: "What's your most embarrassing moment?", category: 'general', difficulty: 'easy' },
  { type: 'truth', text: "What's the biggest lie you've ever told?", category: 'general', difficulty: 'medium' },
  { type: 'truth', text: "What's your biggest fear that no one knows about?", category: 'general', difficulty: 'hard' },
  { type: 'truth', text: "What's the most childish thing you still do?", category: 'general', difficulty: 'easy' },
  { type: 'truth', text: "Have you ever cheated on a test?", category: 'general', difficulty: 'medium' },
  
  // Love
  { type: 'truth', text: "Who was your first crush?", category: 'love', difficulty: 'easy' },
  { type: 'truth', text: "What's the most romantic thing you've ever done?", category: 'love', difficulty: 'medium' },
  { type: 'truth', text: "Have you ever been in love with two people at once?", category: 'love', difficulty: 'hard' },
  { type: 'truth', text: "What's your ideal first date?", category: 'love', difficulty: 'easy' },
  { type: 'truth', text: "Have you ever kissed someone you didn't like?", category: 'love', difficulty: 'medium' },
  { type: 'truth', text: "What's the longest time you've had a crush on someone?", category: 'love', difficulty: 'easy' },
  
  // Friendship
  { type: 'truth', text: "Have you ever lied to your best friend?", category: 'friendship', difficulty: 'medium' },
  { type: 'truth', text: "What's something you've never told your friends?", category: 'friendship', difficulty: 'hard' },
  { type: 'truth', text: "Who's your favorite friend and why?", category: 'friendship', difficulty: 'medium' },
  { type: 'truth', text: "Have you ever talked behind a friend's back?", category: 'friendship', difficulty: 'hard' },
  
  // Spicy
  { type: 'truth', text: "What's your biggest turn-on?", category: 'spicy', difficulty: 'hard' },
  { type: 'truth', text: "Have you ever sent a flirty text to the wrong person?", category: 'spicy', difficulty: 'medium' },
  { type: 'truth', text: "What's the most daring thing you've done on a date?", category: 'spicy', difficulty: 'extreme' },
  { type: 'truth', text: "What's your secret fantasy?", category: 'spicy', difficulty: 'extreme' },
  
  // Funny
  { type: 'truth', text: "What's the weirdest dream you've ever had?", category: 'funny', difficulty: 'easy' },
  { type: 'truth', text: "What's the most embarrassing song in your playlist?", category: 'funny', difficulty: 'easy' },
  { type: 'truth', text: "If you could be any animal, what would you be and why?", category: 'funny', difficulty: 'easy' },
  
  // Deep
  { type: 'truth', text: "What's your biggest regret in life?", category: 'deep', difficulty: 'hard' },
  { type: 'truth', text: "What are you most afraid of losing?", category: 'deep', difficulty: 'extreme' },
  { type: 'truth', text: "If you could change one thing about yourself, what would it be?", category: 'deep', difficulty: 'hard' },
]

const dareQuestions: Question[] = [
  // General
  { type: 'dare', text: "Do your best impression of someone in the room", category: 'general', difficulty: 'easy' },
  { type: 'dare', text: "Let someone go through your phone for 1 minute", category: 'general', difficulty: 'hard' },
  { type: 'dare', text: "Do 20 push-ups right now", category: 'general', difficulty: 'medium' },
  { type: 'dare', text: "Speak in an accent for the next 3 rounds", category: 'general', difficulty: 'medium' },
  { type: 'dare', text: "Dance with no music for 1 minute", category: 'general', difficulty: 'medium' },
  
  // Love
  { type: 'dare', text: "Text your crush and say something sweet", category: 'love', difficulty: 'hard' },
  { type: 'dare', text: "Compliment everyone in the room", category: 'love', difficulty: 'easy' },
  { type: 'dare', text: "Write a love poem on the spot", category: 'love', difficulty: 'medium' },
  { type: 'dare', text: "Serenade someone in the room", category: 'love', difficulty: 'hard' },
  
  // Friendship
  { type: 'dare', text: "Call a friend and tell them a secret", category: 'friendship', difficulty: 'medium' },
  { type: 'dare', text: "Post an embarrassing selfie on social media", category: 'friendship', difficulty: 'hard' },
  { type: 'dare', text: "Let your friend post anything on your social media", category: 'friendship', difficulty: 'extreme' },
  
  // Spicy
  { type: 'dare', text: "Share your most embarrassing romantic moment", category: 'spicy', difficulty: 'hard' },
  { type: 'dare', text: "Describe your ideal partner in detail", category: 'spicy', difficulty: 'medium' },
  { type: 'dare', text: "Do a slow-motion model walk", category: 'spicy', difficulty: 'medium' },
  
  // Funny
  { type: 'dare', text: "Talk like a robot for the next 3 rounds", category: 'funny', difficulty: 'easy' },
  { type: 'dare', text: "Act like a monkey for 1 minute", category: 'funny', difficulty: 'easy' },
  { type: 'dare', text: "Sing everything you say for the next 2 rounds", category: 'funny', difficulty: 'medium' },
  { type: 'dare', text: "Do your best TikTok dance", category: 'funny', difficulty: 'easy' },
  
  // Deep
  { type: 'dare', text: "Share something you've never told anyone", category: 'deep', difficulty: 'extreme' },
  { type: 'dare', text: "Apologize to someone you've wronged via text", category: 'deep', difficulty: 'hard' },
  { type: 'dare', text: "Tell everyone what you're most insecure about", category: 'deep', difficulty: 'extreme' },
]

export default function TruthOrDarePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<'truth' | 'dare' | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['general', 'love', 'friendship', 'funny'])
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty[]>(['easy', 'medium', 'hard'])
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set())
  const [gameStarted, setGameStarted] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [playerName, setPlayerName] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [gameMode, setGameMode] = useState<'solo' | 'multiplayer'>('solo')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const getRandomQuestion = (type: 'truth' | 'dare') => {
    const questions = type === 'truth' ? truthQuestions : dareQuestions
    const filteredQuestions = questions.filter(
      q => selectedCategories.includes(q.category) && 
           selectedDifficulty.includes(q.difficulty) &&
           !usedQuestions.has(q.text)
    )

    if (filteredQuestions.length === 0) {
      setUsedQuestions(new Set())
      return getRandomQuestion(type)
    }

    const randomIndex = Math.floor(Math.random() * filteredQuestions.length)
    const question = filteredQuestions[randomIndex]
    setUsedQuestions(prev => new Set([...prev, question.text]))
    return question
  }

  const handleChoice = (type: 'truth' | 'dare') => {
    setGameStarted(true)
    setSelectedType(type)
    const question = getRandomQuestion(type)
    setCurrentQuestion(question)
  }

  const handleNewQuestion = () => {
    if (selectedType) {
      const question = getRandomQuestion(selectedType)
      setCurrentQuestion(question)
    }
  }

  const resetGame = () => {
    setSelectedType(null)
    setCurrentQuestion(null)
    setGameStarted(false)
    setSelectedPlayer(null)
  }

  const addPlayer = () => {
    if (playerName.trim() && players.length < 10) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: playerName.trim()
      }
      setPlayers([...players, newPlayer])
      setPlayerName('')
    }
  }

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id))
  }

  const spinBottle = () => {
    if (players.length === 0) return
    
    setIsSpinning(true)
    
    // Simulate spin animation
    setTimeout(() => {
      const randomPlayer = players[Math.floor(Math.random() * players.length)]
      setSelectedPlayer(randomPlayer)
      setIsSpinning(false)
      
      // Auto-select a random truth or dare
      const randomType: 'truth' | 'dare' = Math.random() > 0.5 ? 'truth' : 'dare'
      const question = getRandomQuestion(randomType)
      setSelectedType(randomType)
      setCurrentQuestion(question)
      setGameStarted(true)
    }, 2000)
  }

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleDifficulty = (difficulty: Difficulty) => {
    setSelectedDifficulty(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    )
  }

  const categoryIcons: Record<Category, React.ReactNode> = {
    general: <Sparkles className="w-5 h-5" />,
    love: <Heart className="w-5 h-5" />,
    friendship: <Users className="w-5 h-5" />,
    spicy: <Flame className="w-5 h-5" />,
    funny: '😄',
    deep: '🤔'
  }

  const difficultyColors = {
    easy: 'from-green-500 to-emerald-500',
    medium: 'from-yellow-500 to-orange-500',
    hard: 'from-orange-500 to-red-500',
    extreme: 'from-red-500 to-purple-500'
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-[#020617]">Loading...</div>
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-purple-900/10 to-pink-900/10 text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/games" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Games
          </Link>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
            >
              <h3 className="text-xl font-bold mb-4">Game Settings</h3>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Categories</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(['general', 'love', 'friendship', 'spicy', 'funny', 'deep'] as Category[]).map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`p-3 rounded-xl border transition-all flex items-center gap-2 capitalize ${
                        selectedCategories.includes(category)
                          ? 'bg-pink-500/20 border-pink-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      {categoryIcons[category]}
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Difficulty</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['easy', 'medium', 'hard', 'extreme'] as Difficulty[]).map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => toggleDifficulty(difficulty)}
                      className={`p-3 rounded-xl border transition-all capitalize ${
                        selectedDifficulty.includes(difficulty)
                          ? 'bg-gradient-to-r ' + difficultyColors[difficulty] + ' border-white/20 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Sound Effects</span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Truth or Dare
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            {gameStarted ? 'Are you ready for the challenge?' : 'Ready to reveal secrets and take on dares?'}
          </p>
          
          {/* Game Mode Selector */}
          {!gameStarted && (
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setGameMode('solo')}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  gameMode === 'solo'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                Solo Mode
              </button>
              <button
                onClick={() => setGameMode('multiplayer')}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  gameMode === 'multiplayer'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                🎲 Multiplayer (Spin the Bottle)
              </button>
            </div>
          )}
        </motion.div>

        {/* Multiplayer Player Input */}
        {gameMode === 'multiplayer' && !gameStarted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-bold mb-4">Add Players</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="Enter player name..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                maxLength={20}
              />
              <button
                onClick={addPlayer}
                disabled={!playerName.trim() || players.length >= 10}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add
              </button>
            </div>

            {/* Players List */}
            {players.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-2">{players.length} player{players.length !== 1 ? 's' : ''} added:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm font-medium truncate">{player.name}</span>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spin Bottle Button */}
            {players.length > 0 && (
              <button
                onClick={spinBottle}
                disabled={isSpinning}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                <motion.div
                  animate={isSpinning ? { rotate: 1080 } : {}}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  🍾
                </motion.div>
                {isSpinning ? 'Spinning...' : 'Spin the Bottle!'}
              </button>
            )}
          </motion.div>
        )}

        {/* Main Game Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!currentQuestion && gameMode === 'solo' ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Truth Button */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice('truth')}
                  className="relative group overflow-hidden rounded-3xl p-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 hover:border-blue-400 transition-all"
                >
                  <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-all" />
                  <div className="relative z-10">
                    <div className="text-6xl mb-4">💭</div>
                    <h2 className="text-4xl font-black text-blue-400 mb-2">TRUTH</h2>
                    <p className="text-gray-400">Reveal your secrets</p>
                  </div>
                </motion.button>

                {/* Dare Button */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice('dare')}
                  className="relative group overflow-hidden rounded-3xl p-12 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-500/50 hover:border-pink-400 transition-all"
                >
                  <div className="absolute inset-0 bg-pink-500/10 group-hover:bg-pink-500/20 transition-all" />
                  <div className="relative z-10">
                    <div className="text-6xl mb-4">⚡</div>
                    <h2 className="text-4xl font-black text-pink-400 mb-2">DARE</h2>
                    <p className="text-gray-400">Take the challenge</p>
                  </div>
                </motion.button>
              </motion.div>
            ) : currentQuestion ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl"
              >
                {/* Selected Player (Multiplayer) */}
                {selectedPlayer && gameMode === 'multiplayer' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mb-6 text-center"
                  >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-full">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span className="text-xl font-bold text-white">{selectedPlayer.name}</span>
                    </div>
                  </motion.div>
                )}

                {/* Type Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${
                    selectedType === 'truth' 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      : 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                  }`}>
                    {selectedType}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 capitalize">{currentQuestion.category}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${difficultyColors[currentQuestion.difficulty]} capitalize`}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                    {currentQuestion.text}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => gameMode === 'multiplayer' ? spinBottle() : handleNewQuestion()}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    {gameMode === 'multiplayer' ? (
                      <>
                        <Play className="w-5 h-5" />
                        Next Player
                      </>
                    ) : (
                      <>
                        <Shuffle className="w-5 h-5" />
                        New {selectedType}
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetGame}
                    className="px-6 py-4 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all"
                  >
                    Back to Start
                  </motion.button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Instructions */}
        {!gameStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-4">How to Play</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
                <div>
                  <div className="text-2xl mb-2">1️⃣</div>
                  <p>Choose Truth or Dare</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">2️⃣</div>
                  <p>Answer honestly or complete the dare</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">3️⃣</div>
                  <p>Have fun and keep it respectful!</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
