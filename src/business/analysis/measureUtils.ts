import { Cartesian3, Entity, Color } from 'cesium';
import {
	MeasureInfo,
	MeasureType,
	LineMeasureInfo,
	AreaMeasureInfo,
	SurfaceMeasureInfo,
} from './types';

/**
 * 格式化坐标点为字符串
 */
export function formatCartesian3(position: Cartesian3): string {
	return `(${position.x.toFixed(2)}, ${position.y.toFixed(
		2
	)}, ${position.z.toFixed(2)})`;
}

/**
 * 格式化距离为字符串
 */
export function formatDistance(distance: number): string {
	if (distance >= 1000) {
		return `${(distance / 1000).toFixed(2)} km`;
	}
	return `${distance.toFixed(2)} m`;
}

/**
 * 格式化面积为字符串
 */
export function formatArea(area: number): string {
	if (area >= 1000000) {
		return `${(area / 1000000).toFixed(2)} km²`;
	}
	return `${area.toFixed(2)} m²`;
}

/**
 * 格式化测量信息为显示数据
 */
export function formatMeasureInfo(info: MeasureInfo) {
	if (!info || typeof info !== 'object') {
		console.error('无效的测量信息:', info);
		return null;
	}

	try {
		switch (info.type) {
			case 'LINE':
				if (isLineMeasureInfo(info)) {
					return formatLineMeasureInfo(info);
				}
				break;
			case 'AREA':
				if (isAreaMeasureInfo(info)) {
					return formatAreaMeasureInfo(info);
				}
				break;
			case 'SURFACE':
				if (isSurfaceMeasureInfo(info)) {
					return formatSurfaceMeasureInfo(info);
				}
				break;
		}
		console.error('测量信息格式不正确:', info);
		return null;
	} catch (error) {
		console.error('格式化测量信息时出错:', error);
		return null;
	}
}

/**
 * 格式化线段测量信息
 */
function formatLineMeasureInfo(info: LineMeasureInfo) {
	return {
		id: info.id,
		segmentName: info.segmentName || '线段测量',
		startPoint: formatCartesian3(info.startPoint),
		endPoint: formatCartesian3(info.endPoint),
		distance: formatDistance(info.distance),
		verticalDistance: formatDistance(info.verticalDistance),
		horizontalDistanceX: formatDistance(info.horizontalDistanceX),
		horizontalDistanceY: formatDistance(info.horizontalDistanceY),
	};
}

/**
 * 格式化面积测量信息
 */
function formatAreaMeasureInfo(info: AreaMeasureInfo) {
	return {
		id: info.id,
		segmentName: info.segmentName || '面积测量',
		vertexCount: info.vertexCount,
		perimeter: formatDistance(info.perimeter),
		area: formatArea(info.area),
	};
}

/**
 * 格式化表面积测量信息
 */
function formatSurfaceMeasureInfo(info: SurfaceMeasureInfo) {
	return {
		id: info.id,
		segmentName: info.segmentName || '表面积测量',
		deviceId: info.deviceId,
		surfaceArea: formatArea(info.surfaceArea),
	};
}

/**
 * 创建测量实体的默认样式
 */
export const defaultMeasureStyles = {
	line: {
		width: 2,
		material: '#3974F6',
		clampToGround: true,
	},
	point: {
		pixelSize: 8,
		color: '#3974F6',
		outlineColor: '#ffffff',
		outlineWidth: 2,
	},
	polygon: {
		material: 'rgba(57,116,246,0.5)',
		outline: true,
		outlineColor: '#3974F6',
	},
};

/**
 * 清除测量实体
 */
export function clearMeasureEntities(viewer: any, entityIds: string[]) {
	entityIds.forEach((id) => {
		const entity = viewer.entities.getById(id);
		if (entity) {
			viewer.entities.remove(entity);
		}
	});
}

/**
 * 生成唯一ID
 */
export function generateMeasureId(type: MeasureType): string {
	return `${type.toLowerCase()}_${Date.now()}_${Math.random()
		.toString(36)
		.substr(2, 9)}`;
}

// 类型守卫函数
function isLineMeasureInfo(info: any): info is LineMeasureInfo {
	return (
		info.type === 'LINE' &&
		info.startPoint &&
		info.endPoint &&
		typeof info.distance === 'number' &&
		typeof info.verticalDistance === 'number' &&
		typeof info.horizontalDistanceX === 'number' &&
		typeof info.horizontalDistanceY === 'number'
	);
}

function isAreaMeasureInfo(info: any): info is AreaMeasureInfo {
	return (
		info.type === 'AREA' &&
		Array.isArray(info.positions) &&
		typeof info.vertexCount === 'number' &&
		typeof info.perimeter === 'number' &&
		typeof info.area === 'number'
	);
}

function isSurfaceMeasureInfo(info: any): info is SurfaceMeasureInfo {
	return (
		info.type === 'SURFACE' &&
		typeof info.deviceId === 'string' &&
		typeof info.surfaceArea === 'number'
	);
}
