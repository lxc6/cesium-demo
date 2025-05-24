import { Cartesian3 } from 'cesium';

export type MeasureType = 'LINE' | 'AREA' | 'SURFACE';

export interface BaseMeasureInfo {
	id: string;
	type: MeasureType;
	segmentName?: string;
}

export interface LineMeasureInfo extends BaseMeasureInfo {
	type: 'LINE';
	startPoint: Cartesian3;
	endPoint: Cartesian3;
	distance: number;
	verticalDistance: number;
	horizontalDistanceX: number;
	horizontalDistanceY: number;
}

export interface AreaMeasureInfo extends BaseMeasureInfo {
	type: 'AREA';
	positions: Cartesian3[];
	vertexCount: number;
	perimeter: number;
	area: number;
}

export interface SurfaceMeasureInfo extends BaseMeasureInfo {
	type: 'SURFACE';
	deviceId: string;
	surfaceArea: number;
}

export type MeasureInfo =
	| LineMeasureInfo
	| AreaMeasureInfo
	| SurfaceMeasureInfo;
