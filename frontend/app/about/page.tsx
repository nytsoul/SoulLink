import Link from 'next/link'
import { Heart, Users, Shield, Sparkles, ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-purple-900/10 to-pink-900/10 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <h1 className="text-5xl md:text-6xl font-black mb-8 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          About SoulLink
        </h1>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-lg">
              SoulLink is dedicated to connecting hearts and fostering meaningful relationships through the power of AI-driven technology. We believe that everyone deserves to find genuine connections, whether romantic or platonic.
            </p>
          </section>

          <section className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">What Makes Us Different</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Heart className="w-8 h-8 text-pink-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Dual Mode</h3>
                  <p>Switch seamlessly between Love and Friendship modes to find exactly what you're looking for.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Sparkles className="w-8 h-8 text-purple-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">AI-Powered</h3>
                  <p>Advanced AI algorithms help create personalized matches and provide intelligent conversation assistance.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Shield className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Secure & Private</h3>
                  <p>Face verification, end-to-end encryption, and blockchain technology protect your data and identity.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Users className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Community First</h3>
                  <p>Build genuine connections in a safe, respectful, and inclusive environment.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">Our Story</h2>
            <p className="text-lg mb-4">
              Founded in 2024, SoulLink emerged from a simple observation: traditional dating and friendship apps were failing to create meaningful, lasting connections. We set out to change that.
            </p>
            <p className="text-lg mb-4">
              By combining cutting-edge AI technology with a deep understanding of human relationships, we've created a platform that goes beyond superficial swiping. Our dual-mode approach recognizes that people are looking for different types of connections at different times in their lives.
            </p>
            <p className="text-lg">
              Today, we're proud to serve thousands of users worldwide, helping them find love, friendship, and everything in between.
            </p>
          </section>

          <section className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
            <ul className="space-y-4 text-lg">
              <li className="flex items-start gap-3">
                <span className="text-pink-500 text-2xl">•</span>
                <div>
                  <strong className="text-white">Authenticity:</strong> We encourage genuine profiles and honest interactions.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 text-2xl">•</span>
                <div>
                  <strong className="text-white">Safety:</strong> Your security and privacy are our top priorities.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 text-2xl">•</span>
                <div>
                  <strong className="text-white">Inclusivity:</strong> Everyone is welcome, regardless of who they are or who they love.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-2xl">•</span>
                <div>
                  <strong className="text-white">Innovation:</strong> We continuously improve our platform with the latest technology.
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
