"use client"

import Link from 'next/link'
import { Heart, Users, Sparkles, Shield, Calendar, MessageCircle, Zap, Star, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/30 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Social Matching
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-white via-pink-200 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl animate-fade-in-up">
              Welcome to
            </span>
            <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-fade-in-up delay-200">
              SoulLink
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-300">
            A dual-mode social matching platform with <span className="text-pink-400 font-semibold">AI features</span>, 
            <span className="text-purple-400 font-semibold"> face verification</span>, and 
            <span className="text-blue-400 font-semibold"> blockchain integration</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-fade-in-up delay-500">
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Login
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-20 animate-fade-in-up delay-700">
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">2+</div>
              <div className="text-sm text-gray-400 font-medium">Connection Modes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">AI</div>
              <div className="text-sm text-gray-400 font-medium">Powered Features</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent mb-2">100%</div>
              <div className="text-sm text-gray-400 font-medium">Secure & Private</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up delay-1000">
          <FeatureCard
            icon={<Heart className="w-8 h-8" />}
            title="Dual Mode"
            description="Switch between Love and Friends modes to find the right connections"
            gradient="from-rose-500/20 to-pink-500/20"
            iconColor="text-rose-400"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI Powered"
            description="Generate poems, quizzes, and get personalized advice"
            gradient="from-amber-500/20 to-orange-500/20"
            iconColor="text-amber-400"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Secure & Private"
            description="Face verification, encrypted memories, and blockchain proofs"
            gradient="from-emerald-500/20 to-green-500/20"
            iconColor="text-emerald-400"
          />
          <FeatureCard
            icon={<MessageCircle className="w-8 h-8" />}
            title="Smart Chat"
            description="Secure messaging with AI assistant for conversation tips"
            gradient="from-blue-500/20 to-cyan-500/20"
            iconColor="text-blue-400"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Calendar"
            description="Track birthdays, anniversaries, and important events"
            gradient="from-purple-500/20 to-violet-500/20"
            iconColor="text-purple-400"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Games & Fun"
            description="Interactive games to increase engagement and compatibility"
            gradient="from-indigo-500/20 to-blue-500/20"
            iconColor="text-indigo-400"
          />
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20 animate-fade-in-up delay-1200">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            Join thousands finding meaningful connections
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-700 {
          animation-delay: 700ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }

        .delay-1200 {
          animation-delay: 1200ms;
        }
      `}</style>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  gradient,
  iconColor
}: { 
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  iconColor: string
}) {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2">
        <div className={`inline-flex p-4 bg-gradient-to-br ${gradient} rounded-2xl mb-6 ${iconColor}`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity">
          Learn more
          <ArrowRight className="w-4 h-4 text-pink-400" />
        </div>
      </div>
    </div>
  )
}

