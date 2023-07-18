import type { Point, MapMouseEvent, EventData, Map, LngLat } from 'mapbox-gl'

import styles from './area-zoom.module.scss'

type IMapMouseEvent = MapMouseEvent & EventData
interface IPoint {
  screen: Point
  lngLat: LngLat
}

export class AreaZoom {
  private map: Map

  private box: HTMLDivElement | null = null

  protected boxId = 'area-zoom-box'

  private firstPoint: IPoint | null = null

  constructor(map: Map) {
    this.map = map

    this.addListeners()
  }

  private onMouseDown = (event: IMapMouseEvent) => {
    if (event.originalEvent.target !== event.target.getCanvas()) {
      return
    }

    event.target.dragPan.disable()

    this.removeBox()

    this.firstPoint = { screen: event.point, lngLat: event.lngLat }

    this.createBox(event.point)

    this.map.on('mousemove', this.onMouseMove)
    this.map.on('mouseup', this.onMouseUp)
  }

  private onMouseUp = (event: IMapMouseEvent) => {
    event.target.dragPan.enable()
    this.map.off('mousemove', this.onMouseMove)
    this.map.off('mouseup', this.onMouseUp)

    if (
      this.firstPoint &&
      Math.abs(this.firstPoint.screen.x - event.point.x) >= 20 &&
      Math.abs(this.firstPoint.screen.y - event.point.y) >= 20
    ) {
      this.map?.fitBounds(
        [
          this.firstPoint.lngLat.lng,
          this.firstPoint.lngLat.lat,
          event.lngLat.lng,
          event.lngLat.lat,
        ],
        {
          animate: true,
          duration: 200,
        },
      )
    }
    this.removeBox()

    this.firstPoint = null
  }

  private onMouseMove = (event: IMapMouseEvent) => {
    this.updateBox(event.point)
  }

  public addListeners() {
    this.map.on('mousedown', this.onMouseDown)
  }

  public removeListeners() {
    this.map.off('mousedown', this.onMouseDown)
  }

  private createBox(point: Point) {
    const box = document.createElement('div')
    box.id = this.boxId
    box.classList.add(styles.box)
    box.style.top = point.y + 'px'
    box.style.left = point.x + 'px'
    box.style.width = '0px'
    box.style.height = '0px'

    this.box = this.map.getContainer().appendChild(box)
  }

  private updateBox(point: Point) {
    if (this.box && this.firstPoint) {
      const left =
        point.x < this.firstPoint.screen.x ? point.x : this.firstPoint.screen.x
      const width =
        point.x < this.firstPoint.screen.x
          ? this.firstPoint.screen.x - point.x
          : point.x - this.firstPoint.screen.x

      const top =
        point.y < this.firstPoint.screen.y ? point.y : this.firstPoint.screen.y
      const height =
        point.y < this.firstPoint.screen.y
          ? this.firstPoint.screen.y - point.y
          : point.y - this.firstPoint.screen.y

      this.box.style.left = left + 'px'
      this.box.style.width = width + 'px'
      this.box.style.top = top + 'px'
      this.box.style.height = height + 'px'
    }
  }

  private removeBox() {
    this.box?.remove()
    this.map
      .getContainer()
      .querySelector('#' + this.boxId)
      ?.remove()
    this.box = null
  }
}
