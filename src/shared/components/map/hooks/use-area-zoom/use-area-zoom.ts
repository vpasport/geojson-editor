import { useEffect } from 'react'
import { useMap } from 'react-map-gl'

import { AreaZoom } from './area-zoom'

import styles from './area-zoom.module.scss'

export const useAreaZoom = (mapId: string, active: boolean) => {
  const { [mapId]: mapRef } = useMap()

  useEffect(() => {
    if (mapRef && active) {
      mapRef.getMap().getCanvasContainer().classList.add(styles['area-zoom'])
      const areaZoomControl = new AreaZoom(mapRef.getMap())

      return () => {
        mapRef
          .getMap()
          .getCanvasContainer()
          .classList.remove(styles['area-zoom'])
        areaZoomControl.removeListeners()
      }
    }
  }, [mapRef, active])
}
