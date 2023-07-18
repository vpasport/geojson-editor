import type { MapProps as MapGLProps } from 'react-map-gl'

export interface MapProps extends Omit<MapGLProps, 'fog' | 'terrain'> {
  id: string
  mapStyle?: string
  wrapperClassName?: string
  enableRotate?: boolean
  enableZooming?: boolean
  draggable?: boolean
  autoResize?: boolean
}
