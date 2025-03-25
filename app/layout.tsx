import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/navbar'
// Import the new Providers component
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

// This can stay because layout.tsx is now a Server Component
export const metadata: Metadata = {
  title: 'Career Guidance System',
  description: 'Helping students explore colleges and career paths',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}