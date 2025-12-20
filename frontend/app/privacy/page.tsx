import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-purple-900/10 to-pink-900/10 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <Shield className="w-12 h-12 text-blue-500" />
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
        </div>
        <p className="text-gray-400 mb-8">Last updated: December 20, 2025</p>

        <div className="space-y-8 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to SoulLink ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <div className="space-y-3 text-gray-300">
              <h3 className="text-xl font-semibold text-white">Personal Information</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Name, email address, phone number</li>
                <li>Date of birth and gender</li>
                <li>Profile photos and videos</li>
                <li>Location data (with your permission)</li>
                <li>Biometric data for face verification</li>
              </ul>
              <h3 className="text-xl font-semibold text-white mt-4">Usage Information</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Messages and interactions with other users</li>
                <li>Matches, likes, and profile views</li>
                <li>App usage patterns and preferences</li>
                <li>Device information and IP address</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li>To provide and maintain our services</li>
              <li>To match you with compatible users</li>
              <li>To verify your identity and prevent fraud</li>
              <li>To send you notifications and updates</li>
              <li>To improve our AI algorithms and features</li>
              <li>To comply with legal obligations</li>
              <li>To provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Information Sharing</h2>
            <p className="text-gray-300 mb-3">We may share your information with:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li><strong>Other Users:</strong> Profile information and messages you choose to share</li>
              <li><strong>Service Providers:</strong> Third parties who assist in operating our platform</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect rights and safety</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement industry-standard security measures including end-to-end encryption for messages, secure data storage, face verification technology, blockchain-based verification for important records, and regular security audits. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Your Privacy Rights</h2>
            <p className="text-gray-300 mb-3">You have the right to:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Delete your account and data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. If you delete your account, we will delete your personal information within 90 days, except where required by law to retain certain data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected data from a child under 18, we will take steps to delete that information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-white">Email: <a href="mailto:privacy@soullink.com" className="text-blue-400 hover:underline">privacy@soullink.com</a></p>
              <p className="text-white">Address: 143 mode Street, City, State 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
