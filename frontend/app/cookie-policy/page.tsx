import Link from 'next/link'
import { ArrowLeft, Cookie } from 'lucide-react'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-purple-900/10 to-pink-900/10 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <Cookie className="w-12 h-12 text-amber-500" />
          <h1 className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
        </div>
        <p className="text-gray-400 mb-8">Last updated: December 20, 2025</p>

        <div className="space-y-8 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-300 leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website or use our application. They help us provide you with a better experience by remembering your preferences and understanding how you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Types of Cookies We Use</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-xl font-bold text-white mb-2">Essential Cookies</h3>
                <p className="text-gray-300">
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and accessibility. The website cannot function properly without these cookies.
                </p>
                <p className="text-sm text-gray-400 mt-2">Examples: Session cookies, authentication tokens</p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <h3 className="text-xl font-bold text-white mb-2">Performance Cookies</h3>
                <p className="text-gray-300">
                  These cookies collect information about how you use our website, such as which pages you visit most often. This data helps us improve how our website works and identify areas for enhancement.
                </p>
                <p className="text-sm text-gray-400 mt-2">Examples: Analytics cookies, error tracking</p>
              </div>

              <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
                <h3 className="text-xl font-bold text-white mb-2">Functionality Cookies</h3>
                <p className="text-gray-300">
                  These cookies allow our website to remember choices you make (such as your username, language, or region) and provide enhanced, personalized features.
                </p>
                <p className="text-sm text-gray-400 mt-2">Examples: Language preferences, theme settings</p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <h3 className="text-xl font-bold text-white mb-2">Targeting/Advertising Cookies</h3>
                <p className="text-gray-300">
                  These cookies are used to deliver advertisements more relevant to you and your interests. They also help limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.
                </p>
                <p className="text-sm text-gray-400 mt-2">Examples: Ad targeting, remarketing pixels</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Third-Party Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use third-party services that may set cookies on your device. These include:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li><strong>Google Analytics:</strong> To analyze website usage and improve our services</li>
              <li><strong>Authentication Providers:</strong> For secure login and account management</li>
              <li><strong>Payment Processors:</strong> To process transactions securely</li>
              <li><strong>Social Media Platforms:</strong> For social sharing features</li>
              <li><strong>Cloud Services:</strong> For content delivery and performance optimization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. How We Use Cookies</h2>
            <p className="text-gray-300 mb-3">We use cookies to:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our services</li>
              <li>Improve our website's performance and features</li>
              <li>Provide personalized content and recommendations</li>
              <li>Prevent fraud and enhance security</li>
              <li>Deliver relevant advertisements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Managing Cookies</h2>
            <div className="space-y-4 text-gray-300">
              <p>You have several options to manage or disable cookies:</p>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">Browser Settings</h3>
                <p>Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or delete certain cookies. Note that disabling cookies may affect the functionality of our website.</p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">Cookie Preferences</h3>
                <p>You can manage your cookie preferences through our cookie consent tool, which appears when you first visit our website. You can change your preferences at any time.</p>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">Opt-Out Tools</h3>
                <p>For advertising cookies, you can opt out through industry opt-out tools like the Network Advertising Initiative (NAI) or the Digital Advertising Alliance (DAA).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Cookie Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              Different cookies have different lifespans. Session cookies are temporary and are deleted when you close your browser. Persistent cookies remain on your device until they expire or you delete them. The retention period varies depending on the purpose of the cookie.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Updates to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Your Consent</h2>
            <p className="text-gray-300 leading-relaxed">
              By using our website and services, you consent to the use of cookies in accordance with this Cookie Policy. If you do not agree to our use of cookies, you should adjust your browser settings accordingly or refrain from using our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have questions about our use of cookies, please contact us:
            </p>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-white">Email: <a href="mailto:cookies@soullink.com" className="text-amber-400 hover:underline">cookies@soullink.com</a></p>
              <p className="text-white">Address: 143 mode Street, City, State 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
