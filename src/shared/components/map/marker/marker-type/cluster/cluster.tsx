import type { FC } from 'react';
import type { MarkerProps } from '../../marker.types';

import { useEffect } from 'react';

import { MarkerConfig } from '../../../constants';

import styles from './cluster.module.scss';
import classnames from 'classnames';

export const ClusterMarker: FC<MarkerProps<HTMLDivElement>> = ({
	count,
	color = MarkerConfig.defaultColor,
	hovered = false,
	markerRef,
	onMouseEnter,
	onMouseLeave,
	onUnmount = () => {},
	translucent = false,
}) => {
	useEffect(() => {
		return () => {
			onUnmount();
		};
	}, []);

	return (
		<div
			className={classnames(
				styles.cluster,
				translucent && styles.cluster_translucent,
				hovered && styles.cluster_hovered
			)}
			style={{ background: color }}
			ref={markerRef}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}>
			<span className={styles['cluster-text']}>{count}</span>
			<div
				className={styles['cluster-background']}
				style={{ background: color }}
			/>
		</div>
	);
};
