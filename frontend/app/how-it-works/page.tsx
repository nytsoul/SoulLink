import Link from 'next/link'
import { ArrowLeft, UserPlus, Heart, MessageCircle, Sparkles, Shield, Calendar } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-purple-900/10 to-pink-900/10 text-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          How It Works
        </h1>
        <p className="text-xl text-gray-400 mb-12">
          Finding your perfect match is easier than ever with our AI-powered platform
        </p>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="flex gap-6 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-2xl font-black">
                1
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <UserPlus className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold">Create Your Profile</h2>
              </div>
              <p className="text-gray-300 text-lg">
                Sign up and create your profile. Choose between Love or Friendship mode based on what you're looking for. Complete your profile with photos, interests, and a bio. Our face verification ensures authenticity and safety.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-black">
                2
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold">AI-Powered Matching</h2>
              </div>
              <p className="text-gray-300 text-lg">
                Our advanced AI algorithms analyze your preferences, interests, and behavior to find the most compatible matches. Take our personality quiz and compatibility tests to help the AI understand you better.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-black">
                3
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold">Discover Connections</h2>
              </div>
              <p className="text-gray-300 text-lg">
                Browse through your personalized matches. Like profiles that interest you, and when there's a mutual match, you can start chatting. Play interactive games to break the ice and learn more about each other.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center text-2xl font-black">
                4
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-6 h-6 text-cyan-500" />
                <h2 className="text-2xl font-bold">Start Chatting</h2>
              </div>
              <p className="text-gray-300 text-lg">
                Once matched, use our secure messaging system to get to know each other. Our AI assistant can provide conversation tips and ice-breaker suggestions. All messages are encrypted for your privacy.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-6 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-pink-500 flex items-center justify-center text-2xl font-black">
                5
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold">Build Your Relationship</h2>
              </div>
              <p className="text-gray-300 text-lg">
                Use our calendar to remember important dates, create shared memories in the photo gallery, and use AI-powered features like personalized poems and relationship advice to strengthen your connection.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Premium Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Face Verification</h3>
              <p className="text-gray-400">Ensure authenticity and safety with our advanced face verification system.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Assistance</h3>
              <p className="text-gray-400">Get personalized advice, conversation tips, and compatibility insights.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Dual Mode</h3>
              <p className="text-gray-400">Switch between Love and Friendship modes anytime you want.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl p-12 border border-pink-500/20">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands of people finding meaningful connections</p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  )
}
