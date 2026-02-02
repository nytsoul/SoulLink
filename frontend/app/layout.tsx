import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AuthProvider } from '@/hooks/useAuth'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SoulLink - Connect Beyond Boundaries',
  description: 'Next-generation social matching platform with AI-powered matching, dual-mode discovery, and blockchain security',
  icons: {
    icon: '/favicon.svg',
  },
  keywords: ['social matching', 'AI dating', 'friendship app', 'secure messaging', 'blockchain'],
  authors: [{ name: 'SoulLink Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <div className="animated-bg" />
        <Providers>
          <AuthProvider>
            <div className="relative min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 pt-20 relative z-10">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}

