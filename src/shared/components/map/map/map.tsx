import type { MapRef } from 'react-map-gl';
import type { MapProps } from './map.types';

import { memo, useRef, useEffect } from 'react';
import MapGL from 'react-map-gl';
import maplibregl from 'maplibre-gl';

import { MapStyle, defaultStyle, defaultInitView } from '../constants';

import 'maplibre-gl/dist/maplibre-gl.css';
// import 'mapbox-gl/dist/mapbox-gl.css'

import styles from './map.module.scss';
import classnames from 'classnames';

export const Map = memo<MapProps>(function MapMemo({
  id,
  mapStyle = MapStyle.SPHERE,
  style,
  children,
  initialViewState = defaultInitView,
  wrapperClassName,
  enableRotate = false,
  enableZooming = true,
  draggable = true,
  boxZoom = false,
  autoResize = true,
  ...props
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (autoResize && wrapperRef.current) {
      const observer = new ResizeObserver(() => {
        mapRef.current?.resize();
      });
      observer.observe(wrapperRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [wrapperRef.current, mapRef.current]);

  useEffect(() => {
    if (mapRef.current) {
      if (enableRotate) {
        mapRef.current.getMap().dragRotate.enable();
        mapRef.current.getMap().touchZoomRotate.enable();
        mapRef.current.getMap().touchPitch.enable();
      } else {
        mapRef.current.getMap().dragRotate.disable();
        mapRef.current.getMap().touchZoomRotate.disable();
        mapRef.current.getMap().touchPitch.disable();
      }
    }
  }, [mapRef.current, enableRotate]);

  useEffect(() => {
    if (mapRef.current) {
      if (draggable) {
        mapRef.current.getMap().dragPan.enable();
        mapRef.current.getMap().touchZoomRotate.enable();
      } else {
        mapRef.current.getMap().dragPan.disable();
        mapRef.current.getMap().touchZoomRotate.disable();
      }
    }
  }, [mapRef.current, draggable]);

  useEffect(() => {
    if (mapRef.current) {
      if (enableZooming) {
        mapRef.current.getMap().touchZoomRotate.enable();
        mapRef.current.getMap().scrollZoom.enable();
        mapRef.current.getMap().doubleClickZoom.enable();
      } else {
        mapRef.current.getMap().touchZoomRotate.disable();
        mapRef.current.getMap().scrollZoom.disable();
        mapRef.current.getMap().doubleClickZoom.disable();
      }
    }
  }, [mapRef.current, enableZooming]);

  return (
    <div ref={wrapperRef} className={classnames(styles['map-wrapper'], wrapperClassName)}>
      <MapGL
        ref={mapRef}
        id={id}
        initialViewState={initialViewState}
        mapStyle={mapStyle}
        // mapStyle={'mapbox://styles/mapbox/streets-v12'}
        style={{ ...defaultStyle, ...style }}
        mapLib={maplibregl}
        // mapboxAccessToken="pk.eyJ1IjoidnBhc3BvcnQiLCJhIjoiY2xmODE1eDdpMHdpZjNzcGMxd2tsOThkZSJ9.J0-tNM05xkKGpJ6NzVki-Q"
        // projection="globe"
        boxZoom={boxZoom}
        {...props}
      >
        {children}
      </MapGL>
    </div>
  );
});
