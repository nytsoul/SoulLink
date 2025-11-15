import Link from 'next/link'
import { Heart, Users, Sparkles, Shield, Calendar, MessageCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Welcome to Loves
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          A dual-mode social matching platform with AI features, face verification, and blockchain integration
        </p>

        <div className="flex gap-4 justify-center mb-16">
          <Link
            href="/register"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
          >
            Login
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            icon={<Heart className="w-8 h-8" />}
            title="Dual Mode"
            description="Switch between Love and Friends modes to find the right connections"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI Powered"
            description="Generate poems, quizzes, and get personalized advice"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Secure & Private"
            description="Face verification, encrypted memories, and blockchain proofs"
          />
          <FeatureCard
            icon={<MessageCircle className="w-8 h-8" />}
            title="Smart Chat"
            description="Secure messaging with AI assistant for conversation tips"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Calendar"
            description="Track birthdays, anniversaries, and important events"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Games & Fun"
            description="Interactive games to increase engagement and compatibility"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}

