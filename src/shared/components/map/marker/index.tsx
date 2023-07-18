import type { FC } from 'react';
import type { MarkerPropsWithType } from './marker.types';

import { createElement } from 'react';
import { Marker as MapGLMarker } from 'react-map-gl';

import * as MarkerTypes from './marker-type';

export const Marker: FC<MarkerPropsWithType> = ({ type, ...props }) => {
	return (
		<MapGLMarker {...props}>
			{createElement(MarkerTypes[type], props)}
		</MapGLMarker>
	);
};

const MarkerContent = {
	Icon: MarkerTypes.icon,
	Cluster: MarkerTypes.cluster,
	Panorama: MarkerTypes.panorama,
};

export { MarkerContent };
