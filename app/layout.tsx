import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PerformanceOptimizer from '@/components/PerformanceOptimizer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  themeColor: '#E6EEF6', 
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, 
}

export const metadata: Metadata = {
  title: {
    template: '%s | Shipment Tracker',
    default: 'Shipment Tracker - Smart Logistics Management',
  },
  description: 'Sistem pelacakan shipment dan dukungan engagement modern untuk efisiensi logistik maksimal.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`scroll-smooth ${inter.variable}`}>
      <body className={`${inter.className} bg-azure-bg text-text-primary antialiased relative overflow-x-hidden selection:bg-accent-primary selection:text-white`}>
        <PerformanceOptimizer />
        
        {/* --- DYNAMIC BACKGROUND ELEMENTS (FRESH & ALIVE) --- */}
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
           {/* Blob 1: Top Left - Cyan/Blue */}
           <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-float bg-gradient-to-r from-cyan-300 to-blue-300"></div>
           
           {/* Blob 2: Bottom Right - Purple/Indigo */}
           <div className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-float bg-gradient-to-l from-indigo-300 to-purple-300" style={{ animationDelay: '2s' }}></div>
           
           {/* Blob 3: Center Accent - Soft White Glow */}
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-white opacity-20 filter blur-[100px]"></div>
        </div>

        <main className="min-h-screen flex flex-col relative z-0">
          {children}
        </main>
      </body>
    </html>
  )
}