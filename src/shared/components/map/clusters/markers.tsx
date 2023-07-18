import { FC, useMemo, ReactNode } from 'react';
import type {
	MarkersProps,
	IClusterProps,
	MarkerProps,
	MarkerPropsWithType,
	HoveredMarker,
	IPointProps,
	ClusterProps,
	PointProps,
	MarkersRef,
} from './markers.types';

import {
	useCallback,
	useRef,
	useState,
	useEffect,
	forwardRef,
	useImperativeHandle,
} from 'react';
import { useMap, Marker as MarkerGL } from 'react-map-gl';
import { usePopper } from 'react-popper';

import { usePrevious } from '@shared/hooks';

import { tooltipConfig, MarkerConfig } from '../constants';
import { useCluster } from '../hooks';
import { MarkerContent } from '../marker';

import styles from './markers.module.scss';
import classnames from 'classnames';
import { nanoid } from 'nanoid';

const renderClusterComponentDefault = (props: ClusterProps) => {
	return <MarkerContent.Cluster {...props} />;
};

const renderPointComponentDefault = (props: PointProps) => {
	return <MarkerContent.Icon {...props} />;
};

export const Markers = forwardRef<MarkersRef | null | undefined, MarkersProps>(
	(
		{
			mapId,
			points,
			clustered = true,
			selectedPoint,
			tooltips = true,
			clusterTooltips = true,
			tooltipModifiers,
			withoutTooltip = [],
			closeClusterOnZooming = true,
			renderTooltip = () => <></>,
			renderClusterComponent = renderClusterComponentDefault,
			renderPointComponent = renderPointComponentDefault,
			renderSpreadClusterComponent = renderPointComponentDefault,
			onClusterClick = () => {},
			onPointClick = () => {},
		},
		ref
	) => {
		const { [mapId]: mapRef } = useMap();

		const pointsInfo = useRef<Map<number, IPointProps>>(new Map());
		const clustersInfo = useRef<
			Map<number, MarkerPropsWithType & IClusterProps>
		>(new Map());
		// Все кластеры
		const clusterElementsMap = useRef<Map<number, HTMLElement | null>>(
			new Map()
		);
		const withoutTooltipSet = useRef<Set<number>>(new Set(withoutTooltip));
		// Все точки
		const pointElementsMap = useRef<Map<number, HTMLElement | null>>(
			new Map()
		);
		const tooltipElement = useRef<HTMLDivElement>(null);

		const [spreadCluster, setSpreadCluster] = useState<number | null>(null);
		const [spreadClusterElement, setSpreadClusterElement] =
			useState<ReactNode | null>(null);
		const [hoveredMarker, setHoveredMarker] =
			useState<HoveredMarker | null>(null);
		const [tooltipContent, setTooltipContent] = useState<ReactNode | null>(
			null
		);

		const { clusters, forceClustering, clustersMap, pointsMap } =
			useCluster(mapRef, points, clustered);
		const { styles: popperStyles, update: tooltipUpdate } = usePopper(
			hoveredMarker?.element,
			tooltipElement.current,
			{
				...tooltipConfig,
				modifiers: tooltipModifiers ?? tooltipConfig.modifiers,
			}
		);
		const prevPopperStyles = usePrevious(popperStyles);

		// Приближение к кластеру до его распада
		const toCluster = useCallback(
			({
				id,
				zoom,
				latitude,
				longitude,
			}: {
				id: number;
				zoom: number;
				latitude: number;
				longitude: number;
			}) => {
				return () => {
					if (mapRef?.getMaxZoom() && mapRef?.getMaxZoom() > zoom) {
						mapRef?.flyTo({
							zoom,
							center: [longitude, latitude],
							animate: true,
							duration: 500,
						});
						setTimeout(() => forceClustering, 510);
					} else {
						setSpreadCluster((prev) => (id === prev ? null : id));
					}
				};
			},
			[mapRef, forceClustering]
		);

		// Для обноления тултипов с учетом маркеров, на которых их не должно быть
		const updateHoveredMarker = useCallback(
			(value: HoveredMarker) => {
				if (value.isCluster) {
					setHoveredMarker(value);
				} else {
					if (!withoutTooltipSet.current.has(value.id)) {
						setHoveredMarker(value);
					} else {
						setHoveredMarker(null);
					}
				}
			},
			[withoutTooltipSet]
		);

		// Элементы, которые будут выведены
		const markers = useMemo(() => {
			clustersInfo.current.clear();
			clusterElementsMap.current.clear();

			return clusters.map((point) => {
				let elem;

				if (point.cluster) {
					const cluster = point as IClusterProps;

					const props: MarkerPropsWithType = {
						key: `cluster_${cluster.id}`,
						type: 'cluster',
						latitude: cluster.latitude,
						longitude: cluster.longitude,
						count: cluster.count,
						color: cluster.color,
						onClick() {
							toCluster({
								id: cluster.id,
								zoom: cluster.expansion,
								latitude: cluster.latitude,
								longitude: cluster.longitude,
							})();
							onClusterClick(cluster.id, cluster.points);
						},
						markerRef(ref) {
							clusterElementsMap.current.set(cluster.id, ref);
							spreadCluster !== cluster.id &&
								cluster.points.forEach((point) =>
									pointElementsMap.current.set(point, ref)
								);
						},
						onMouseEnter() {
							if (clusterTooltips) {
								setTooltipContent(
									renderTooltip(cluster.points)
								);
								updateHoveredMarker({
									id: cluster.id,
									isCluster: true,
									element:
										clusterElementsMap.current.get(
											cluster.id
										) ?? null,
								});
							}
						},
						onMouseLeave() {
							if (clusterTooltips) {
								setTooltipContent(null);
								setHoveredMarker(null);
							}
						},
						onUnmount() {
							setSpreadCluster((prev) =>
								prev === cluster.id ? null : prev
							);
						},
					};

					clustersInfo.current.set(cluster.id, {
						...props,
						...cluster,
					});

					elem = (
						<MarkerGL
							key={props.key}
							latitude={props.latitude}
							longitude={props.longitude}
							anchor='center'
							onClick={props.onClick}>
							{renderClusterComponent({
								...props,
								...cluster,
							})}
						</MarkerGL>
					);
				} else {
					const props: MarkerProps = {
						key: nanoid(), //key: `point_${point.id}`,
						latitude: point.latitude,
						longitude: point.longitude,
						color: point.color,
						markerRef(ref) {
							pointElementsMap.current.set(point.id, ref);
						},
						onMouseEnter() {
							setTooltipContent(renderTooltip(point.id));
							updateHoveredMarker({
								id: point.id,
								isCluster: false,
								element:
									pointElementsMap.current.get(point.id) ??
									null,
							});
						},
						onMouseLeave() {
							setTooltipContent(null);
							setHoveredMarker(null);
						},
						onClick() {
							onPointClick(point.id);
						},
					};

					elem = (
						<MarkerGL
							latitude={props.latitude}
							longitude={props.longitude}
							anchor='center'
							onClick={props.onClick}
							key={props.key}
							style={{
								display: 'block',
								zIndex: selectedPoint === point.id ? 100 : 0,
							}}>
							{renderPointComponent({ ...props, ...point })}
						</MarkerGL>
					);
				}

				return elem;
			});
		}, [
			clusters,
			toCluster,
			renderClusterComponent,
			renderPointComponent,
			updateHoveredMarker,
			spreadCluster,
			selectedPoint,
		]);

		const forceTooltipUpdate = useCallback(() => {
			tooltipUpdate && tooltipUpdate();
		}, [tooltipUpdate]);

		// Обновлене положения тултипа при наведении на маркер и перемещении карты
		useEffect(() => {
			if (hoveredMarker && forceTooltipUpdate) {
				forceTooltipUpdate();

				mapRef?.on('move', forceTooltipUpdate);

				return () => {
					mapRef?.off('move', forceTooltipUpdate);
				};
			}
		}, [hoveredMarker, forceTooltipUpdate, mapRef]);

		// Обновления тултипа при изменении элементов внутри карты
		useEffect(() => {
			if (hoveredMarker && forceTooltipUpdate) {
				if (hoveredMarker) {
					const point = hoveredMarker.isCluster
						? clusterElementsMap.current.get(hoveredMarker.id)
						: pointElementsMap.current.get(hoveredMarker.id);

					if (point === hoveredMarker.element) {
						forceTooltipUpdate();
					} else {
						setHoveredMarker(null);
					}
				}
			}
		}, [markers]);

		useEffect(() => {
			if (tooltips) {
				withoutTooltipSet.current.clear();
				withoutTooltip.forEach((el) => {
					setHoveredMarker((prev) => (prev?.id === el ? null : prev));
					withoutTooltipSet.current.add(el);
				});
			}
		}, [withoutTooltip]);

		// Обновление положения тултипа после изменения маркеров, на которых его быть не должно
		useEffect(() => {
			if (hoveredMarker !== null) {
				updateHoveredMarker(hoveredMarker);
			}
		}, [withoutTooltipSet]);

		useEffect(() => {
			if (mapRef) {
				const closeCluster = (
					e: mapboxgl.MapMouseEvent & mapboxgl.EventData
				) => {
					if (e.originalEvent.target === e.target.getCanvas()) {
						setSpreadCluster(null);
					}
				};

				mapRef.on('click', closeCluster);

				return () => {
					mapRef.off('click', closeCluster);
				};
			}
		}, [mapRef]);

		useEffect(() => {
			pointsInfo.current.clear();
			if (points.length) {
				points.forEach((point) =>
					pointsInfo.current.set(point.id, {
						cluster: false,
						color: MarkerConfig.defaultColor,
						...point,
					})
				);
			}
		}, [points]);

		useEffect(() => {
			if (spreadCluster !== null) {
				setHoveredMarker(null);
				const clusterInfo = clustersInfo.current.get(spreadCluster);
				if (clusterInfo) {
					clusterElementsMap.current
						.get(spreadCluster)
						?.classList.add(styles['cluster-spread']);

					const points = clusterInfo.points;

					setSpreadClusterElement(
						<MarkerGL
							longitude={clusterInfo.longitude}
							latitude={clusterInfo.latitude}
							anchor='center'
							onClick={(e) => {
								if (
									(
										e.originalEvent.target as HTMLElement
									).classList.contains(
										styles['cluster-spread-content']
									)
								) {
									setSpreadCluster(null);
								}
							}}>
							<div
								className={classnames(
									styles['cluster-spread-content'],
									styles[
										`cluster-spread-content_rows_${
											points.length >= 3
												? 3
												: points.length % 3
										}`
									]
								)}>
								{points.map((point) => {
									const props = pointsInfo.current.get(point);

									return props ? (
										renderSpreadClusterComponent({
											...props,
											markerRef(ref) {
												pointElementsMap.current.set(
													props.id,
													ref
												);
											},
											onClick() {
												console.debug(props.id);
												onPointClick(props.id);
											},
											onMouseEnter() {
												setTooltipContent(
													renderTooltip(props.id)
												);
												updateHoveredMarker({
													id: props.id,
													isCluster: false,
													element:
														pointElementsMap.current.get(
															props.id
														) ?? null,
												});
											},
											onMouseLeave() {
												setTooltipContent(null);
												setHoveredMarker(null);
											},
											key: String(props.id),
										})
									) : (
										<></>
									);
								})}
							</div>
						</MarkerGL>
					);

					return () => {
						clusterElementsMap.current
							.get(spreadCluster)
							?.classList.remove(styles['cluster-spread']);
						setSpreadClusterElement(null);
					};
				}
			}
		}, [
			spreadCluster,
			clusterElementsMap.current,
			renderSpreadClusterComponent,
		]);

		// Закрываем открытый кластер, если выбранный маркер находится не в нем
		useEffect(() => {
			if (selectedPoint) {
				if (spreadCluster) {
					const clusterInfo = clustersInfo.current.get(spreadCluster);
					if (
						clusterInfo &&
						clusterInfo.points.includes(selectedPoint)
					) {
						return;
					}
				}

				setSpreadCluster(null);
			}
		}, [selectedPoint]);

		useEffect(() => {
			if (closeClusterOnZooming && mapRef) {
				const closeCluster = () => {
					setSpreadCluster(null);
				};

				mapRef.on('zoom', closeCluster);

				return () => {
					mapRef.off('zoom', closeCluster);
				};
			}
		}, [closeClusterOnZooming]);

		useImperativeHandle(
			ref,
			() => ({
				clusters: clustersMap,
				points: pointsMap,
			}),
			[clustersMap, pointsMap]
		);

		return (
			<>
				{markers}
				{spreadClusterElement}
				{tooltips && (
					<div
						ref={tooltipElement}
						className={classnames(
							styles.tooltip,
							hoveredMarker && styles.tooltip_visible
						)}
						style={
							hoveredMarker === null
								? prevPopperStyles?.popper
								: popperStyles.popper
						}>
						{tooltipContent}
					</div>
				)}
			</>
		);
	}
);
