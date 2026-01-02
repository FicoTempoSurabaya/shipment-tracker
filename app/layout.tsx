import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PerformanceOptimizer from '@/components/PerformanceOptimizer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shipment Tracker - Tracking Report & Engagement Support System',
  description: 'Sistem pelacakan shipment dan dukungan engagement untuk manajemen logistik',
  keywords: ['shipment', 'tracking', 'logistics', 'delivery', 'management'],
  authors: [{ name: 'Shipment Tracker Team' }],
  creator: 'Shipment Tracker',
  publisher: 'Shipment Tracker',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipment Tracker',
    description: 'Sistem pelacakan shipment dan dukungan engagement',
    creator: '@shipmenttracker',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#E6F0FA" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <PerformanceOptimizer />
        {children}
      </body>
    </html>
  )
}