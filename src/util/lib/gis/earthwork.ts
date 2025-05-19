import { bearing, destination, point } from '@turf/turf';

// 根据顶部与底部面积 计算土方量
export function calculateEarthwork(volumeTop: number, volumeBottom: number): number {
    return Math.sqrt(volumeTop ** 2 + volumeBottom ** 2 + volumeTop * volumeBottom) / 6;
}

// 根据坐标点与深度，比率生成底边坐标点
export function volumeBottomPoints(polygonCoords, slopeRatio: number, depth: number) {
    return polygonCoords.map(cord => {
        const point1 = point(cord);
        const angle = bearing(point(cord), point(cord));
        const point2 = destination(point1, slopeRatio * depth, angle);
        return point2.geometry.coordinates;
    });
}
