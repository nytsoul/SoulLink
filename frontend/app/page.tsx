"use client"

import Link from 'next/link'
import { Heart, Users, Sparkles, Shield, Calendar, MessageCircle, Zap, Star, ArrowRight, Play, CheckCircle, Globe, Lock, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  iconColor: string
  delay?: number
}

function FeatureCard({ icon, title, description, gradient, iconColor, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`group relative p-8 rounded-3xl glass hover:shadow-glass-lg transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
      <div className="relative z-10">
        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} ${iconColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-gray-300 group-hover:text-gray-100 transition-colors leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

function StatCard({ value, label, icon, delay = 0 }: { value: string; label: string; icon: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="text-center p-6 rounded-2xl glass hover:shadow-glow-primary transition-all duration-300 hover:scale-105"
    >
      <div className="flex items-center justify-center mb-3">
        <div className="p-3 rounded-full bg-gradient-primary mr-3">
          {icon}
        </div>
        <div className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {value}
        </div>
      </div>
      <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">{label}</div>
    </motion.div>
  )
}

const testimonials = [
  { name: "Sarah M.", text: "Found my soulmate through SoulLink's AI matching. The personality quiz was spot-on!", rating: 5 },
  { name: "Jake R.", text: "Amazing platform for making genuine friendships. The verification system makes it so safe!", rating: 5 },
  { name: "Emma L.", text: "Love the dual-mode feature. I can switch between dating and friendship seamlessly.", rating: 5 },
]

const stats = [
  { value: "99%", label: "Success Rate", icon: <CheckCircle className="w-6 h-6 text-white" /> },
  { value: "24/7", label: "AI Support", icon: <Zap className="w-6 h-6 text-white" /> },
  { value: "100%", label: "Verified", icon: <Shield className="w-6 h-6 text-white" /> },
]

const features = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Dual Connection Mode",
    description: "Seamlessly switch between romantic matching and friendship discovery with our intelligent dual-mode system.",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400"
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "AI-Powered Matching",
    description: "Advanced AI analyzes your personality, preferences, and behavior to find your perfect match or best friend.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Enhanced Security",
    description: "Face verification, blockchain proofs, and encrypted messaging ensure your safety and privacy.",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400"
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Smart Communication",
    description: "Ice-breaker suggestions, conversation starters, and AI-powered chat assistance.",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400"
  },
  {
    icon: <Calendar className="w-8 h-8" />,
    title: "Event Planning",
    description: "Plan dates, meetups, and activities with integrated calendar and location services.",
    gradient: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-400"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Connections",
    description: "Connect with people worldwide or in your local area with precise location matching.",
    gradient: "from-cyan-500/20 to-teal-500/20",
    iconColor: "text-cyan-400"
  }
]

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen bg-dark-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="text-center">
          {/* Hero Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass mb-8 group hover:shadow-glow-primary transition-all duration-300"
          >
            <Sparkles className="w-5 h-5 text-pink-400 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-sm font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Next-Gen Social Matching Platform
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight"
          >
            <span className="block gradient-text mb-4">
              Connect Beyond
            </span>
            <span className="block bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Boundaries
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            Experience the future of social connections with{' '}
            <span className="text-pink-400 font-bold">AI-powered matching</span>,{' '}
            <span className="text-purple-400 font-bold">dual-mode discovery</span>, and{' '}
            <span className="text-blue-400 font-bold">blockchain security</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <Link
              href="/register"
              className="group relative px-10 py-4 bg-gradient-primary rounded-full font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow-primary"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <button className="group px-10 py-4 glass rounded-full font-bold text-lg hover:shadow-glass-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
            {stats.map((stat, index) => (
              <StatCard key={stat.label} {...stat} delay={0.8 + index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="gradient-text">Powerful Features</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover what makes SoulLink the most advanced social matching platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={index * 0.1} />
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="gradient-text">Success Stories</span>
          </h2>
          <p className="text-xl text-gray-300">What our users say about their experience</p>
        </motion.div>

        <motion.div
          key={currentTestimonial}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center p-8 glass rounded-3xl max-w-2xl mx-auto"
        >
          <div className="flex justify-center mb-4">
            {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-xl text-gray-200 mb-6 leading-relaxed italic">
            "{testimonials[currentTestimonial].text}"
          </p>
          <p className="text-pink-400 font-bold">— {testimonials[currentTestimonial].name}</p>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center glass rounded-3xl p-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="gradient-text">Ready to Connect?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have found meaningful connections through SoulLink
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-10 py-4 bg-gradient-primary rounded-full font-bold text-lg hover:shadow-glow-primary transition-all duration-300 hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 glass rounded-full font-bold text-lg hover:shadow-glass-lg transition-all duration-300 hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
