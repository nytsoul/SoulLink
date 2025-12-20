import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-purple-900/10 to-pink-900/10 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <FileText className="w-12 h-12 text-purple-500" />
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Terms of Service
          </h1>
        </div>
        <p className="text-gray-400 mb-8">Last updated: December 20, 2025</p>

        <div className="space-y-8 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using SoulLink, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Eligibility</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              You must be at least 18 years old to use our services. By creating an account, you represent and warrant that:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You are not prohibited from using the service under applicable laws</li>
              <li>You will comply with these Terms and all applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              To use our services, you must create an account. You agree to:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Complete face verification when required</li>
              <li>You are responsible for all activity under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. User Conduct</h2>
            <p className="text-gray-300 mb-3">You agree NOT to:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li>Use the service for any illegal purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Post false, inaccurate, or misleading information</li>
              <li>Use bots, scripts, or automated tools</li>
              <li>Impersonate any person or entity</li>
              <li>Collect user information without consent</li>
              <li>Engage in commercial or spam activities</li>
              <li>Upload viruses or malicious code</li>
              <li>Interfere with the proper functioning of the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Content</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Your Content</h3>
                <p>You retain ownership of content you post. However, you grant us a worldwide, non-exclusive, royalty-free license to use, modify, and display your content to provide our services.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Prohibited Content</h3>
                <p>You may not post content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of privacy, hateful, or racially or ethnically objectionable.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Matching & Interactions</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li>We use AI algorithms to suggest matches, but we do not guarantee compatibility</li>
              <li>We are not responsible for the conduct of users you meet through our platform</li>
              <li>Always meet in public places and take appropriate safety precautions</li>
              <li>You can choose between Love and Friendship modes, but mode selection is permanent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Premium Features & Payments</h2>
            <p className="text-gray-300 leading-relaxed">
              Certain features may require payment. All fees are non-refundable except as required by law. We reserve the right to modify pricing at any time with notice. Subscriptions automatically renew unless canceled before the renewal date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              The platform and its original content, features, and functionality are owned by SoulLink and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our services without our permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for any reason, including violation of these Terms. You may also delete your account at any time through the app settings. Upon termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Disclaimers</h2>
            <p className="text-gray-300 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE ARE NOT RESPONSIBLE FOR THE CONDUCT OF USERS OR THE ACCURACY OF INFORMATION PROVIDED BY USERS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOULINK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">12. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where our company is registered, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or app notification. Continued use of the service after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              For questions about these Terms, please contact us:
            </p>
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-white">Email: <a href="mailto:legal@soullink.com" className="text-purple-400 hover:underline">legal@soullink.com</a></p>
              <p className="text-white">Address: 143 mode Street, City, State 12345</p>
              <p className="text-white">Phone: +1 (234) 567-890</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
