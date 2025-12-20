import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, AlertTriangle, Users, CheckCircle } from 'lucide-react'

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-purple-900/10 to-pink-900/10 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <Shield className="w-16 h-16 text-emerald-500" />
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
            Safety Center
          </h1>
        </div>
        <p className="text-xl text-gray-400 mb-12">
          Your safety and privacy are our top priorities
        </p>

        <div className="space-y-8">
          {/* Security Features */}
          <section className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Lock className="w-8 h-8 text-blue-500" />
              Security Features
            </h2>
            <div className="space-y-4 text-gray-300">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Face Verification</h3>
                  <p>All users must complete face verification to ensure authentic profiles and reduce catfishing.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">End-to-End Encryption</h3>
                  <p>All messages and shared content are encrypted, ensuring only you and your match can see them.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Blockchain Verification</h3>
                  <p>Important moments and consent records are stored on blockchain for immutable proof.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Privacy Controls</h3>
                  <p>You control who sees your profile, photos, and personal information at all times.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Safety Tips */}
          <section className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Eye className="w-8 h-8 text-purple-500" />
              Safety Tips
            </h2>
            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">🔒 Protect Your Personal Information</h3>
                <p className="text-gray-300">Never share financial information, passwords, or sensitive personal details with matches.</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">📍 Meet in Public Places</h3>
                <p className="text-gray-300">Always meet in a public location for the first few dates and let someone know where you're going.</p>
              </div>
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">🚩 Trust Your Instincts</h3>
                <p className="text-gray-300">If something feels off, it probably is. Don't hesitate to block or report suspicious users.</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">📱 Use In-App Communication</h3>
                <p className="text-gray-300">Keep conversations within the app until you feel comfortable sharing other contact information.</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">🔍 Research Your Matches</h3>
                <p className="text-gray-300">Use social media and other tools to verify your match's identity before meeting in person.</p>
              </div>
            </div>
          </section>

          {/* Reporting */}
          <section className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              Report & Block
            </h2>
            <div className="text-gray-300 space-y-4">
              <p className="text-lg">
                If you encounter inappropriate behavior, harassment, or suspicious activity, please report it immediately. Our team reviews all reports within 24 hours.
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">How to Report</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">1.</span>
                    <span>Go to the user's profile or chat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">2.</span>
                    <span>Click the three dots menu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">3.</span>
                    <span>Select "Report User" or "Block User"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">4.</span>
                    <span>Provide details about the issue</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Community Guidelines */}
          <section className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-500" />
              Community Guidelines
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="text-lg">We maintain a safe, respectful community by enforcing these guidelines:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  <span>Be respectful and kind to all users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Use authentic photos and information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>No harassment, hate speech, or bullying</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>No spam or solicitation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>No illegal or harmful content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Respect boundaries and consent</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-gray-300 mb-6">
              Our safety team is available 24/7 to assist you with any concerns.
            </p>
            <a
              href="mailto:safety@soullink.com"
              className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full font-bold hover:shadow-lg transition-all hover:scale-105"
            >
              Contact Safety Team
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
