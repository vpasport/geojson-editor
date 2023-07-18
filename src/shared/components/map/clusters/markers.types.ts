import type { ReactElement, ReactNode } from 'react'
import type { Modifier, StrictModifierNames } from 'react-popper'
import type { MarkerProps, MarkerPropsWithType } from '../marker/marker.types'
import type {
  IPoint as IPointProps,
  ICluster as IClusterProps,
  IPointMapElement,
  IClusterMapElement,
} from '../hooks/use-cluster'

interface IPoint {
  id: number
  longitude: number
  latitude: number
  tooltip?: ReactNode
}

export interface HoveredMarker {
  element: HTMLElement | null
  isCluster: boolean
  id: number
}

export type PointProps = IPointProps & MarkerProps
export type ClusterProps = MarkerPropsWithType & IPointProps

export interface MarkersProps {
  points: IPoint[]
  mapId: string
  clustered?: boolean
  selectedPoint?: number
  tooltips?: boolean
  clusterTooltips?: boolean
  withoutTooltip?: number[]
  tooltipModifiers?: Modifier<StrictModifierNames>[]
  closeClusterOnZooming?: boolean
  renderTooltip?: (id: number | number[]) => ReactNode
  renderPointComponent?: (point: PointProps) => ReactElement<MarkerProps>
  renderClusterComponent?: (point: ClusterProps) => ReactElement<MarkerProps>
  renderSpreadClusterComponent?: (
    point: PointProps,
  ) => ReactElement<MarkerProps>
  onPointClick?: (id: number) => void
  onClusterClick?: (clusterId: number, pointIds: number[]) => void
  withoutPointerEventsOnSelected? : boolean
}

export interface MarkersRef {
  points: Map<number, IPointMapElement>
  clusters: Map<number, IClusterMapElement>
}

export { IClusterProps, IPointProps, MarkerPropsWithType, MarkerProps }
