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
  themeColor: '#E0F2FE', // Matches new azure-bg
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Mencegah zoom berlebihan pada input form di mobile
}

export const metadata: Metadata = {
  title: {
    template: '%s | Shipment Tracker',
    default: 'Shipment Tracker - Smart Logistics Management',
  },
  description: 'Sistem pelacakan shipment dan dukungan engagement modern untuk efisiensi logistik maksimal.',
  keywords: ['shipment', 'tracking', 'logistics', 'delivery', 'management', 'freelance'],
  authors: [{ name: 'Shipment Tracker Team' }],
  creator: 'Shipment Tracker',
  publisher: 'Shipment Tracker',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://shipment-tracker.vercel.app',
    title: 'Shipment Tracker',
    description: 'Sistem pelacakan shipment dan dukungan engagement',
    siteName: 'Shipment Tracker',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`scroll-smooth ${inter.variable}`}>
      <body className={`${inter.className} bg-azure-bg text-text-primary antialiased min-h-screen selection:bg-accent-primary selection:text-white overflow-x-hidden relative`}>
        <PerformanceOptimizer />
        
        {/* Ambient Background Elements - Memberikan kesan 'fresh' & depth halus */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-50 pointer-events-none opacity-60">
           {/* Top Left Blob */}
           <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-br from-blue-200/40 to-cyan-200/40 blur-3xl filter animate-pulse-slow"></div>
           
           {/* Bottom Right Blob */}
           <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-tl from-indigo-200/40 to-sky-200/40 blur-3xl filter animate-pulse-slow animate-delay-200"></div>
           
           {/* Center Accent (Very subtle) */}
           <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-white/20 blur-3xl filter mix-blend-overlay"></div>
        </div>

        <main className="relative z-0 flex min-h-screen flex-col">
          {children}
        </main>
      </body>
    </html>
  )
}