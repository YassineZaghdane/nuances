/**
 * @module useAnimateOnScroll
 * @description Hook animation au scroll via IntersectionObserver
 */
"use client"
import { useEffect, useRef, useState } from 'react'

interface Options {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useAnimateOnScroll(options: Options = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px', once = true } = options
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, visible }
}
