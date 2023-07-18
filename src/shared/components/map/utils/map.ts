import { lineString } from '@turf/helpers'
import bbox from '@turf/bbox'

import { MapConstant } from '../constants'

/**
 * Возвращает границы по переданным координатам для установки
 * границ зума
 * @param points
 * @param defaultCoords
 * @returns
 */
export const getPointsBounds = (
  points: [number, number][],
  defaultCoords: [number, number] = [
    MapConstant.DEFAULT_LNG,
    MapConstant.DEFAULT_LAT,
  ],
): [[number, number], [number, number]] => {
  if (points.length > 1) {
    // Получаем geoJSON линии по переданным точкам
    const line = lineString(points)
    // Получаем координаты гриниц линии
    const [minLng, minLat, maxLng, maxLat] = bbox(line)

    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ]
  } else {
    // Если точки не переданы, возвращаем дефолтные координаты
    if (points.length === 0) {
      return [defaultCoords, defaultCoords]
    }

    /**
     * Если точка одна, то ее координаты будут и макимальными
     * и минимальными
     *
     * Получаем [ [minLng, minLat], [maxLng, maxLat] ] из одной точки
     */
    return [points[0], points[0]]
  }
}

export const getFilledArea = (
  size: number,
  rowSize = 3,
  gap = { horizontal: 160, vertical: 80 },
  padding = 40,
) => {
  const coords = []

  // const maxLeft = (rowSize * gap.horizontal) / 2
  const maxLeft = 0

  for (let row = 0; row < size / rowSize; row++) {
    for (let col = 0; col < rowSize; col++) {
      coords.push({
        top: row * gap.vertical + padding,
        left: col * gap.horizontal - maxLeft,
      })
    }
  }

  return coords
}

export const getSpiral = (
  initCoord = {
    x: 0,
    y: 0,
  },
  size = 3,
  spiralWidth = 8.5,
  angle = 14.5,
) => {
  const points = []

  let oldX = initCoord.x
  let oldY = initCoord.y

  for (let i = 5; i < size + 5; i++) {
    const newAngle = (angle / 15) * i
    const x = initCoord.x + spiralWidth * newAngle * Math.sin(newAngle)
    const y = initCoord.y + spiralWidth * newAngle * Math.cos(newAngle)

    points.push({
      x,
      y,
    })

    oldX = x
    oldY = y
  }

  return points
}
