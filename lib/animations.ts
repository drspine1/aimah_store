import type { Variants } from 'motion/react'

/** Standard viewport config — triggers once when 15% of element is visible */
export const viewport = { once: true, amount: 0.15 } as const

// Shared transition presets
const smooth = { duration: 0.6, ease: 'easeOut' as const }
const smoothFast = { duration: 0.5, ease: 'easeOut' as const }
const smoothSlow = { duration: 0.65, ease: 'easeOut' as const }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...smooth, delay },
  }),
}

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { ...smoothSlow, delay },
  }),
}

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { ...smoothSlow, delay },
  }),
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { ...smoothFast, delay },
  }),
}

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { ...smooth, delay },
  }),
}
