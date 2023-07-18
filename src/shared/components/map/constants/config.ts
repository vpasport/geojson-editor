import type { CSSProperties } from 'react';
import type { ViewState, PaddingOptions, LngLatBoundsLike } from 'react-map-gl';
import type { Options } from '@popperjs/core';
import type { Modifier, StrictModifierNames } from 'react-popper';

export const MapStyle = {
  SPHERE: `${process.env.REACT_APP_TILES_SERVER}/styles/sphere/style.json`,
  DEFAULT: `${process.env.REACT_APP_TILES_SERVER}/styles/default/style.json`,
  BRIGHT: `${process.env.REACT_APP_TILES_SERVER}/styles/bright/style.json`,
  STREET: `${process.env.REACT_APP_TILES_SERVER}/styles/streets/style.json`,
};

export const MapConstant = {
  DEFAULT_LAT: 61,
  DEFAULT_LNG: 86,

  MAX_BOUNDS: [
    [30.169759437450836, 59.884807263463046],
    [30.509394964091854, 59.99122297070687],
  ] as LngLatBoundsLike,

  DEFAULT_ZOOM: 2,
  MINI_MAP_DEFAULT_ZOOM: 16,

  MIN_ZOOM: 2,
  MAX_ZOOM: 18,
  MIN_MINIMAP_ZOOM: 15,
  MAX_MINIMAP_ZOOM: 18,

  ZOOM_TYPE_FAR: 11.5,
  ZOOM_TYPE_MIDDLE: 14,
  ZOOM_TYPE_CLOSE: 16,
};

export const waterColor = '#86ccfa';

export const defaultStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  // background: waterColor,
};

export const LINE_LAYER_ID_PREFIX = 'streets-type';

export const defaultInitViewPadding: PaddingOptions = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

export const defaultInitView: ViewState = {
  latitude: MapConstant.DEFAULT_LAT,
  longitude: MapConstant.DEFAULT_LNG,
  zoom: MapConstant.DEFAULT_ZOOM,
  pitch: 0,
  bearing: 0,
  padding: defaultInitViewPadding,
};

export const ClusterConfig = {
  options: {
    radius: 60,
    maxZoom: 20,
  },
  zoomDiff: 0.5,
};

export const MarkerConfig = {
  defaultColor: '#12A12F',
  multiClusterColor: '#a3b2b9',
};

export const tooltipConfig: Omit<Partial<Options>, 'modifiers'> & {
  modifiers: ReadonlyArray<Modifier<StrictModifierNames>>;
} = {
  placement: 'top',
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 16],
      },
    },
    {
      name: 'preventOverflow',
      options: {
        padding: {
          top: 200,
          bottom: 40,
          left: 40,
          right: 40,
        },
      },
    },
    {
      name: 'flip',
      options: {
        fallbackPlacements: ['bottom', 'left', 'right'],
      },
    },
  ],
};
