import Link from 'next/link'
import { Mail, Phone, MapPin, Heart, Twitter, Instagram, Facebook, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-dark-900 border-t border-white/10 text-white mt-auto overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <h3 className="text-2xl font-black gradient-text">SoulLink</h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Connecting hearts and friendships through AI-powered matching. 
              Experience the future of social connections with secure, verified, 
              and meaningful relationships.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="p-3 glass rounded-xl hover:shadow-glow-primary transition-all hover:scale-110">
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="p-3 glass rounded-xl hover:shadow-glow-primary transition-all hover:scale-110">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="p-3 glass rounded-xl hover:shadow-glow-primary transition-all hover:scale-110">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="p-3 glass rounded-xl hover:shadow-glow-primary transition-all hover:scale-110">
                <Github className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 text-white text-lg">Quick Links</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-pink-400 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-pink-400 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">How It Works</span>
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-pink-400 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Safety Center</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-pink-400 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Blog</span>
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-pink-400 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-bold mb-6 text-white text-lg">Legal & Support</h4>
            <ul className="space-y-3 text-gray-400 mb-6">
              <li>
                <Link href="/privacy" className="hover:text-purple-400 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-purple-400 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-purple-400 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Cookie Policy</span>
                </Link>
              </li>
            </ul>

            {/* Contact Info */}
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-3 group">
                <div className="p-2 glass rounded-lg group-hover:bg-white/10 transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <a href="mailto:hello@soullink.com" className="hover:text-blue-400 transition-colors">
                  hello@soullink.com
                </a>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-2 glass rounded-lg group-hover:bg-white/10 transition-all">
                  <Phone className="w-4 h-4" />
                </div>
                <a href="tel:+1234567890" className="hover:text-blue-400 transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400">
              <p>&copy; {new Date().getFullYear()} SoulLink. All rights reserved.</p>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-red-400 animate-pulse" />
              <span>for meaningful connections</span>
            </div>
            
            <div className="flex items-center space-x-4 text-gray-400 text-sm">
              <span>Version 1.0</span>
              <div className="w-1 h-1 bg-gray-600 rounded-full" />
              <Link href="/changelog" className="hover:text-white transition-colors">
                What's New
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

