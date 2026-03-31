"use client"
import { useEffect, useRef, useState, ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'scale'
}

export function AnimatedSection({ children, delay = 0, direction = 'up' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      )
      if (ref.current) observer.observe(ref.current)
      return () => observer.disconnect()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const getTransform = () => {
    if (visible) return 'none'
    switch (direction) {
      case 'up': return 'translateY(50px)'
      case 'left': return 'translateX(-50px)'
      case 'right': return 'translateX(50px)'
      case 'scale': return 'scale(0.88)'
      default: return 'translateY(50px)'
    }
  }

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, 
                     transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  )
}
