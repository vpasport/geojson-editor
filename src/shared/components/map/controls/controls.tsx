import type { FC } from 'react'
import type { ControlsProps } from './controls.types'

import styles from './controls.module.scss'
import classnames from 'classnames'

export const Controls: FC<ControlsProps> = ({
  position,
  children,
  className,
}) => {
  return (
    <div
      className={classnames(
        styles.controls,
        styles[`controls-${position}`],
        className,
      )}
    >
      {children}
    </div>
  )
}
