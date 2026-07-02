"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

import { useReducedMotion } from "../../hooks/use-reduced-motion"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

function PageTransition({ children, className }: PageTransitionProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerChildrenProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

function StaggerChildren({ children, className, staggerDelay = 0.05 }: StaggerChildrenProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={{ visible: { transition: { staggerChildren: staggerDelay } } }}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

const childVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const childProps = {
  variants: childVariants,
}

export { PageTransition, StaggerChildren, childProps }
