import type { ReactNode } from 'react'

type StandardPosition = 'top' | 'right' | 'bottom' | 'left'
type AnglePosition = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'

export interface ControlsProps {
  position: StandardPosition | AnglePosition
  children: ReactNode
  className?: string
}
