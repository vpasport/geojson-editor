import type { RefObject, RefCallback } from 'react';
import type { MarkerProps as MapGLMarkerProps } from 'react-map-gl';

export type MarkerType = 'icon' | 'cluster' | 'panorama';
type MarkerSize = 'small' | 'medium' | 'large';
export enum MarkerIcons {
  Default = 'icon-cult',
}

export interface MarkerProps<Ref extends HTMLElement = HTMLDivElement>
  extends MapGLMarkerProps {
  isVisible?: boolean;
  key?: string;
  size?: MarkerSize;
  selected?: boolean;
  hovered?: boolean;
  translucent?: boolean;
  withTooltip?: boolean;
  count?: number;
  isDot?: boolean;
  icon?: MarkerIcons;
  title?: string;
  markerRef?: RefObject<Ref> | RefCallback<Ref>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onUnmount?: () => void;
  onClick?: () => void;
  work_type?: null | number;
  object_type?: null | number;
  contentId?: null | number;
}

export interface MarkerPropsWithType<Ref extends HTMLElement = HTMLDivElement>
  extends MarkerProps<Ref> {
  type: MarkerType;
}
