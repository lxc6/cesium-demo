import { Geometry } from '@turf/turf';
import { SuperMapQueryGeometry } from './types';

export function convertGeometry<G extends Geometry = Geometry>(
    geometry: G,
    partTopo?: number[]
): SuperMapQueryGeometry {
    const customGeometry: SuperMapQueryGeometry = {
        style: null,
        parts: [],
        points: [],
        partTopo,
        type: 'REGION',
        prjCoordSys: { epsgCode: 4326 }
    };
    const { coordinates } = geometry;
    // 如果报错请手动判断没有处理过的图形定义
    switch (geometry.type) {
        case 'Polygon': {
            // 超图的复杂图形条件查询，需要把所有的点都平铺在points数组中 然后通过parts数组来截取范围 partTopo来确认中空或者面对象
            coordinates.forEach(crd => {
                customGeometry.parts.push(crd.length);
                crd.forEach(point => {
                    customGeometry.points.push({
                        x: point[0],
                        y: point[1]
                    });
                });
            });
            // customGeometry.type = 'GEOCOMPOUND';
            break;
        }
        default:
            customGeometry.parts.push(coordinates.length);
            customGeometry.points = coordinates.map(point => ({
                x: point[0],
                y: point[1],
                type: 'Point',
                geometryType: 'Point'
            }));
    }

    return customGeometry;
}
