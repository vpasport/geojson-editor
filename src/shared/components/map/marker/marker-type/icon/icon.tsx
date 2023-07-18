import type { FC } from 'react';
import type { MarkerProps } from '../../marker.types';

import { useRef, useCallback, useState, useEffect } from 'react';
import { isSafari } from 'react-device-detect';

import { usePrevious } from '@shared/hooks';

import { MarkerIcons } from '../../marker.types';

import styles from './icon.module.scss';
import classnames from 'classnames';

export const iconSelectedClassName = styles['map-marker_selected'];
export const iconHoveredClassName = styles['map-marker_hovered'];
export const iconTranslucentClassName = styles['map-marker_translucent'];
export const iconDotClassName = styles['map-marker_dot'];

export const svgAnimationProperty = {
	default:
		'M98 80C98 88.7435 91.7658 96.031 83.5 97.6599C82.6851 97.8205 81.8504 97.9261 81 97.9727C80.669 97.9908 80.3356 98 80 98C79.6644 98 79.331 97.9908 79 97.9727C78.1496 97.9261 77.3149 97.8205 76.5 97.6599C68.2342 96.031 62 88.7435 62 80C62 70.0589 70.0589 62 80 62C89.9411 62 98 70.0589 98 80Z',
	dot: 'M88 80C88 83.886 85.2293 87.1249 81.5556 87.8489C81.1934 87.9202 80.8224 87.9672 80.4445 87.9879C80.2973 87.9959 80.1491 88 80 88C79.8509 88 79.7027 87.9959 79.5556 87.9879C79.1776 87.9672 78.8066 87.9202 78.4444 87.8489C74.7707 87.1249 72 83.886 72 80C72 75.5817 75.5817 72 80 72C84.4183 72 88 75.5817 88 80Z',
	hovered:
		'M101 67C101 77.2008 93.7268 85.7029 84.0833 87.6033C84.0833 87.6033 83 88 82 89.5C81.6608 90.0089 80.9763 91 80 91C79.0237 91 78.3019 90.0319 78 89.5C77.1667 88.0319 75.9167 87.6033 75.9167 87.6033C66.2732 85.7029 59 77.2008 59 67C59 55.402 68.402 46 80 46C91.598 46 101 55.402 101 67Z',
	selected:
		'M108 37C108 50.6011 98.3024 61.9371 85.4444 64.471C83.5 66.5 83.5988 68.5 82 71.5C81.4444 72.5425 80.522 73 80 73C79.478 73 78.5556 72.5425 78 71.5C76.4506 68.5925 77 66.5 74.5556 64.471C61.6976 61.9371 52 50.6011 52 37C52 21.536 64.536 9 80 9C95.464 9 108 21.536 108 37Z',
	transitionDuration: '0.07s',
};

export const IconMarker: FC<MarkerProps<HTMLDivElement>> = ({
	selected = false,
	isDot = false,
	color,
	icon = MarkerIcons.Default,
	translucent = false,
	hovered = false,
	title,
	onMouseEnter: onMouseEnterProps = () => {},
	onMouseLeave: onMouseLeaveProps = () => {},
	markerRef = () => {},
	style,
	onClick,
}) => {
	const animateRef = useRef<SVGAnimateElement>(null);

	const [defaultPath, setDefaultPath] = useState<string>(
		selected
			? svgAnimationProperty.selected
			: isDot
			? svgAnimationProperty.dot
			: svgAnimationProperty.default
	);
	const [currentPath, setCurrentPath] = useState<string>(defaultPath);
	const prevPath = usePrevious(currentPath);

	const onMouseEnter = useCallback(() => {
		if (isSafari && !selected) {
			setCurrentPath(svgAnimationProperty.hovered);
		}
		onMouseEnterProps();
	}, [selected, onMouseEnterProps]);
	const onMouseLeave = useCallback(() => {
		if (isSafari && !selected) {
			setCurrentPath(defaultPath);
		}
		onMouseLeaveProps();
	}, [defaultPath, selected, onMouseLeaveProps]);

	useEffect(() => {
		setCurrentPath(selected ? svgAnimationProperty.selected : defaultPath);
	}, [selected]);

	useEffect(() => {
		const path = isDot
			? svgAnimationProperty.dot
			: svgAnimationProperty.default;

		if (!selected) {
			setCurrentPath(path);
		}
		setDefaultPath(path);
	}, [isDot]);

	useEffect(() => {
		if (animateRef.current) {
			animateRef.current.setAttribute(
				'values',
				prevPath + ';' + currentPath
			);
			animateRef.current.beginElement();
		}
	}, [currentPath, animateRef.current]);
	//@TODO --transition-default-duration   all 0.16s транзишн для анимации маркера

	return (
		<div
			ref={markerRef}
			className={classnames(
				styles['map-marker-container'],
				isDot && styles['map-marker_dot'],
				selected
					? styles['map-marker_selected']
					: hovered
					? styles['map-marker_hovered']
					: translucent && styles['map-marker_translucent']
			)}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onClick={onClick}
			style={style}>
			<svg
				className={classnames(styles['map-marker-svg'])}
				width='160'
				height='160'
				viewBox='0 0 160 160'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				d={defaultPath}>
				<circle
					className={styles['map-marker-svg-circle']}
					cx='80'
					cy='80'
					r='4'
					stroke={color}
					strokeWidth={2}
				/>

				<path
					className={styles['map-marker-svg-path']}
					strokeWidth='2'
					fill={color}
					d={isSafari ? undefined : defaultPath}>
					{isSafari && (
						<animate
							ref={animateRef}
							keyTimes='0;1'
							attributeName='d'
							dur={svgAnimationProperty.transitionDuration}
							fill='freeze'
							repeatCount='1'
							begin='indefinite'
						/>
					)}
				</path>
			</svg>

			<i className={classnames(icon, styles['map-marker-icon'])} />

			<span className={styles['map-marker-text']} style={{ color }}>
				{title}
			</span>
			<span
				className={classnames(
					styles['map-marker-text'],
					styles['map-marker-text_sublayer']
				)}
				style={{ color }}>
				{title}
			</span>
		</div>
	);
};
