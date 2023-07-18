import type {
	Options,
	PointFeature,
	ClusterFeature,
	ClusterProperties,
} from 'supercluster';
import type { MapRef } from 'react-map-gl';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';

import { throttle } from 'lodash';
import SuperCluster from 'supercluster';
import { point } from '@turf/helpers';

import { getArrayOfObjectDiff } from '@shared/utils';

import { ClusterConfig, MarkerConfig } from '../constants';

interface IPointProps {
	id: number;
	longitude: number;
	latitude: number;
	cluster?: boolean;
	color?: string;
	[key: string]: any;
}

interface IClusterProps {
	id: number;
	points: number[];
	count: number;
	expansion?: number;
	cluster: boolean;
	color: string;
}

export interface IPoint {
	id: number;
	longitude: number;
	latitude: number;
	cluster: boolean;
	color: string;
	[key: string]: any;
}

export interface ICluster extends IPoint {
	points: number[];
	count: number;
	expansion: number;
}

export interface IPointMapElement {
	cluster: number | null;
	longitude: number;
	latitude: number;
}

export interface IClusterMapElement {
	longitude: number;
	latitude: number;
}

type BoundsType = [number, number, number, number];

export const useCluster = <Point extends IPointProps>(
	map: MapRef | undefined,
	points: Point[] | undefined,
	clustered = true,
	options: Options<IPointProps, IClusterProps> = ClusterConfig.options,
	zoomDiff = ClusterConfig.zoomDiff
) => {
	const prevZoom = useRef<number>();
	const pointsMap = useRef<Map<number, IPointMapElement>>(new Map());
	const clustersMap = useRef<Map<number, IClusterMapElement>>(new Map());

	const [prevOpts, setPrevOpts] = useState(options);
	const [opts, setOpts] = useState<Options<IPointProps, IClusterProps>>({
		...options,
		map: (props: IPointProps): IClusterProps => ({
			...props,
			id: props.id,
			points: [props.id],
			count: 1,
			cluster: false,
			color: props.color ?? MarkerConfig.defaultColor,
		}),
		reduce: (acc: IClusterProps, props: IClusterProps) => {
			acc.count = acc.count
				? props.cluster
					? props.count + acc.count
					: acc.count + 1
				: 1;
			acc.points = [
				...acc.points,
				...(props.cluster ? props.points : [props.id]),
			];
			acc.cluster = true;
			acc.color =
				acc.color === props.color
					? acc.color
					: MarkerConfig.multiClusterColor;
			return acc;
		},
	});

	const clusterPoints = useMemo(
		() =>
			points &&
			points.map((el) => {
				return point([el.longitude, el.latitude], {
					...el,
					id: el.id,
					longitude: el.longitude,
					latitude: el.latitude,
					color: el.color ?? MarkerConfig.defaultColor,
				});
			}),

		[points]
	);

	const superCluster = useMemo(() => {
		if (clusterPoints) {
			return new SuperCluster<IPointProps, IClusterProps>(opts).load(
				clusterPoints
			);
		}
		return undefined;
	}, [opts, clusterPoints]);

	const [clusters, setClusters] = useState<(IPoint | ICluster)[]>([]);

	const calculate = useCallback(
		(bounds: BoundsType, zoom: number) => {
			if (!clustered) return;
			if (superCluster) {
				const clusters = superCluster.getClusters(bounds, zoom);

				setClusters(
					clusters.map((point) => {
						clustersMap.current.clear();
						if (point.properties.cluster) {
							const tmp = point as ClusterFeature<
								ClusterProperties & IClusterProps
							>;

							clustersMap.current.set(tmp.properties.cluster_id, {
								latitude: tmp.geometry.coordinates[1],
								longitude: tmp.geometry.coordinates[0],
							});

							tmp.properties.points.forEach((point) => {
								const latLng = pointsMap.current.get(point) ?? {
									latitude: tmp.geometry.coordinates[1],
									longitude: tmp.geometry.coordinates[0],
								};

								pointsMap.current.set(point, {
									...latLng,
									cluster: tmp.properties.cluster_id,
								});
							});

							// Параметры кластера
							return {
								...tmp.properties,
								cluster: true,
								id: tmp.properties.cluster_id,
								points: tmp.properties.points,
								expansion:
									superCluster.getClusterExpansionZoom(
										tmp.properties.cluster_id
									) + 0.1,
								count: tmp.properties.count,
								latitude: tmp.geometry.coordinates[1],
								longitude: tmp.geometry.coordinates[0],
							} as ICluster;
						}

						const tmp = point as PointFeature<IPointProps>;

						// Параметры точки
						return {
							...tmp.properties,
							cluster: false,
							id: tmp.properties.id,
							latitude: tmp.geometry.coordinates[1],
							longitude: tmp.geometry.coordinates[0],
						} as IPoint;
					})
				);
			}
		},
		[clustered, superCluster]
	);

	// Возвращает функию, которую можно вызвать один раз в 200мс
	const clustering = useCallback(
		(type: 'zoom' | 'move') => {
			return throttle(
				(
					e: mapboxgl.MapboxEvent<
						MouseEvent | TouchEvent | WheelEvent | undefined
					> &
						mapboxgl.EventData
				) => {
					if (superCluster) {
						// Получаем зум
						const zoom = e.target.getZoom();

						if (type === 'zoom') {
							// Если не установлено предыдущее значение зума
							if (!prevZoom.current) {
								prevZoom.current = zoom;
							} else {
								// Сравгиваем с предыдущим
								if (
									Math.abs(prevZoom.current - zoom) < zoomDiff
								) {
									// Если разница зумов меньше необходимов, останавливаем перерасчет
									return;
								} else {
									// Иначае обновляем предыдцщее значение зума
									prevZoom.current = zoom;
								}
							}

							calculate(
								e.target
									.getBounds()
									.toArray()
									.flat() as BoundsType,
								zoom
							);
						} else {
							calculate(
								e.target
									.getBounds()
									.toArray()
									.flat() as BoundsType,
								zoom
							);
						}
					} else {
						setClusters([]);
					}
				},
				200
			);
		},
		[superCluster, calculate]
	);

	// Возвращает функцию, которую можно вызвать
	const clusteringZoomThrottle = useMemo(
		() => clustering('zoom'),
		[clustering]
	);
	const clusteringMoveThrottle = useMemo(
		() => clustering('move'),
		[clustering]
	);

	const forceClustering = useCallback(() => {
		if (map) {
			calculate(
				map.getMap().getBounds().toArray().flat() as BoundsType,
				map.getMap().getZoom()
			);
		}
	}, [map, calculate]);

	// Обновление параметров только в случае, когда они действительно изменились
	useEffect(() => {
		if (getArrayOfObjectDiff(prevOpts, options).length > 0) {
			setOpts({
				...options,
			});
			setPrevOpts(options);
		}
	}, [options]);

	useEffect(() => {
		if (map && superCluster) {
			clustered && map.getMap().on('zoom', clusteringZoomThrottle);
			clustered && map.getMap().on('move', clusteringMoveThrottle);

			return () => {
				map.getMap().off('zoom', clusteringZoomThrottle);
				map.getMap().off('move', clusteringMoveThrottle);
			};
		}
	}, [
		map,
		clustered,
		superCluster,
		clusteringMoveThrottle,
		clusteringZoomThrottle,
	]);

	useEffect(() => {
		if (!clustered) {
			setClusters(
				clusterPoints?.map(
					(point) =>
						({
							...point.properties,
							cluster: false,
						} as IPoint)
				) ?? []
			);
		} else {
			forceClustering();
		}
	}, [clustered, clusterPoints, forceClustering]);

	return {
		clusters,
		superCluster,
		pointsMap: pointsMap.current,
		clustersMap: clustersMap.current,
		forceClustering,
	};
};
