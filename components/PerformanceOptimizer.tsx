'use client'

import { useEffect } from 'react'

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Preconnect to important domains
    const preconnectLinks = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://*.vercel-storage.com'
    ]
    
    preconnectLinks.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = href
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
    
    // Preload critical resources
    const preloadResources = [
      { href: '/_next/static/css/app/layout.css', as: 'style' },
      { href: '/_next/static/chunks/webpack.js', as: 'script' },
      { href: '/_next/static/chunks/main-app.js', as: 'script' }
    ]
    
    preloadResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource.href
      link.as = resource.as
      document.head.appendChild(link)
    })
    
    // Cleanup function
    return () => {
      // Cleanup if needed
    }
  }, [])
  
  return null
}