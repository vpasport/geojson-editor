import type { FC } from 'react';
import type { MarkerProps } from '../../marker.types';

import { ActiveMarker } from '@shared/icons';

import styles from './panorama.module.scss';
import classnames from 'classnames';

export const PanoramaMarker: FC<MarkerProps<HTMLDivElement>> = ({
	selected,
	markerRef,
	size = 'medium',
	onMouseEnter,
	onMouseLeave,
}) => {
	return (
		<div
			ref={markerRef}
			className={classnames(
				styles['panorama-marker-container'],
				styles[`panorama-marker-container_${size}`]
			)}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}>
			{selected ? (
				<ActiveMarker className={styles['panorama-marker_icon']} />
			) : (
				<div className={styles['panorama-marker_dot']} />
			)}
		</div>
	);
};
