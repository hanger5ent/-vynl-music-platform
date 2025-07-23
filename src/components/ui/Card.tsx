import { FC } from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
}

interface CardImageProps {
  src: string
  alt: string
}

export const Card: FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

export const CardContent: FC<CardContentProps> = ({ children }) => {
  return (
    <div className="p-4">
      {children}
    </div>
  )
}

export const CardImage: FC<CardImageProps> = ({ src, alt }) => {
  return (
    <img className="w-full h-48 object-cover" src={src} alt={alt} />
  )
}

