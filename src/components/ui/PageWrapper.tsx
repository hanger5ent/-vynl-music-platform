import { ReactNode } from 'react'
import { Header } from '@/components/ui/Header'

interface PageWrapperProps {
  children: ReactNode
  className?: string
  includeHeader?: boolean
  headerSpace?: boolean
}

export function PageWrapper({ 
  children, 
  className = "min-h-screen bg-gray-50", 
  includeHeader = true,
  headerSpace = true 
}: PageWrapperProps) {
  return (
    <div className={className}>
      {includeHeader && <Header />}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${headerSpace ? 'pt-24' : ''}`}>
        {children}
      </div>
    </div>
  )
}

// Alternative wrapper for full-width content
export function FullWidthPageWrapper({ 
  children, 
  className = "min-h-screen bg-gray-50", 
  includeHeader = true,
  headerSpace = true 
}: PageWrapperProps) {
  return (
    <div className={className}>
      {includeHeader && <Header />}
      <div className={headerSpace ? 'pt-20' : ''}>
        {children}
      </div>
    </div>
  )
}
