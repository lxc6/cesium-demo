/**
 *  ---------------------------coordinate.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    三维坐标系的相关处理函数
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/5/17
 *  @Param
 *  @Return
 *  @File           libs/utility/src/lib/cesium/tools
 *  @Update         [time:user] 某用户更新此文件
 * */

import {
    bbox,
    lineString,
    destination as Destination,
    distance as Distance,
} from '@turf/turf';

/**
 * 获取两个Cartesian3的标准化法向向量
 * 如果你交换 vector1 和 vector2 的值，那么结果将不同，因为向量叉积的结果与向量的顺序相关。
 * 向量叉积的结果是一个新的垂直于原始向量的向量。更具体地说，向量叉积的长度等于原始向量的长度乘以它们之间夹角的正弦值，方向垂直于两个原始向量。
 * 这意味着如果你反转向量的顺序，那么它们之间的夹角会变化，结果也会随之改变。
 * 因此，在使用 Cartesian3.cross() 函数计算向量积时，确保将向量按照正确的顺序传递给函数以获得预期的结果。
 * @param vector1
 * @param vector2
 */
export const obtainCartesianNormal = (
    vector1: Cesium.Cartesian3,
    vector2: Cesium.Cartesian3
) =>
    Cesium.Cartesian3.normalize(
        Cesium.Cartesian3.cross(vector1, vector2, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
    );

/**
 * 计算两个点的方位角度
 * @param pointA
 * @param pointB
 * @param type
 * @return {number}
 */
export function courseAngle(
    pointA: Cesium.Cartesian3,
    pointB: Cesium.Cartesian3,
    type: 'radian' | 'angle' = 'angle'
) {
    // 以a点为原点建立局部坐标系（东方向为y轴,北方向为x轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵

    // 以a点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
    const localToWorldMatrix =
        Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
    // 求世界坐标到局部坐标的变换矩阵
    const worldToLocalMatrix = Cesium.Matrix4.inverse(
        localToWorldMatrix,
        new Cesium.Matrix4()
    );
    // a点在局部坐标的位置，其实就是局部坐标原点
    const localPositionA = Cesium.Matrix4.multiplyByPoint(
        worldToLocalMatrix,
        pointA,
        new Cesium.Cartesian3()
    );
    // B点在以A点为原点的局部的坐标位置
    const localPositionB = Cesium.Matrix4.multiplyByPoint(
        worldToLocalMatrix,
        pointB,
        new Cesium.Cartesian3()
    );

    // 弧度
    const angle = Math.atan2(
        localPositionB.x - localPositionA.x,
        localPositionB.y - localPositionA.y
    );
    if (type === 'radian') {
        return angle;
    }
    // 角度
    let theta = angle * (180 / Math.PI);
    if (theta < 0) {
        theta += 360;
    }
    return theta;
}

/**
 * 将笛卡尔坐标转为经纬度
 * @param position
 * @constructor
 */
export function cartesianToLatLng(position: Cesium.Cartesian3) {
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    return {
        lng: Cesium.Math.toDegrees(cartographic.longitude),
        lat: Cesium.Math.toDegrees(cartographic.latitude),
        height: cartographic.height,
    };
}

/**
 * 将string经纬度转成其他格式
 */
export function stringToOtherFormatLatLng(rawCoordinates: any) {
    const coordinateString = rawCoordinates?.coordinates.split(',');
    const coordinateArr = coordinateString.map(Number) as number[];
    const coordinateObj = {
        x: coordinateArr[0],
        y: coordinateArr[1],
        z: coordinateArr[2],
    };
    return { coordinateArr, coordinateObj };
}

/**
 * @description 提供起点&终点经纬度，返回矩形西北角,东南角经纬度
 * @param startLatLng 起点经纬度  示例：[91.500, 22.00]
 * @param endLatLng 终点经纬度
 * @return { {northwest: number[]; southeast: number[]}} northwest 西北角坐标 southeast 东南角坐标
 * */
export function toRectangleLonLat(
    startLatLng: number[],
    endLatLng: number[]
): { northwest: number[]; southeast: number[] } {
    const line = lineString([startLatLng, endLatLng]);
    const box = bbox(line);
    return { northwest: [box[0], box[3]], southeast: [box[2], box[1]] };
}

/**
 * @description 屏幕坐标转换地形经纬度
 * @param viewer Cesium查看器
 * @param position 屏幕坐标
 * */
export function screenToTerrainGraphical(
    viewer: Cesium.Viewer,
    position: { x: number; y: number }
): {
    lng: number;
    lat: number;
} {
    // 获取地形表面经纬度
    const ray = viewer.camera.getPickRay(position as any);
    const cartesian3 = viewer.scene.globe.pick(ray, viewer.scene);
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
    return {
        lng: Cesium.Math.toDegrees(cartographic.longitude),
        lat: Cesium.Math.toDegrees(cartographic.latitude),
    };
}

/**
 * @description 屏幕坐标转换经纬度
 * @param viewer Cesium.Viewer
 * @param position { {x: number, y: number} } 屏幕坐标
 * return {number[]} 经纬度
 * */
export function screenCoordinatesToDegrees(
    viewer: Cesium.Viewer,
    position: { x: number; y: number }
): any {
    // 获取地形表面经纬度
    const ray = viewer.camera.getPickRay(position as any);
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);

    if (!cartesian) {
        // 如果没有拾取到地形，则使用椭球体表面的点
        const ellipsoid = viewer.scene.globe.ellipsoid;
        const cartesianOnEllipsoid = viewer.camera.pickEllipsoid(
            position as any,
            ellipsoid
        );
        if (!cartesianOnEllipsoid) return { lngLat: [], cartesian: undefined };

        const cartographic =
            ellipsoid.cartesianToCartographic(cartesianOnEllipsoid);
        return {
            lngLat: [
                Cesium.Math.toDegrees(cartographic.longitude),
                Cesium.Math.toDegrees(cartographic.latitude),
            ],
            cartesian: cartesianOnEllipsoid,
            cartographicHeight: cartographic.height,
        };
    }

    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    return {
        lngLat: [
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
        ],
        cartesian: cartesian,
        cartographicHeight: cartographic.height,
    };
}

export function screenConvertEllipsoid(
    viewer: Cesium.Viewer,
    position: { x: number; y: number }
): any {
    const ellipsoid = viewer.scene.globe.ellipsoid;
    const cartesian = viewer.camera.pickEllipsoid(position as any, ellipsoid);
    const cartographic = ellipsoid.cartesianToCartographic(cartesian);

    return {
        lngLat: [
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
        ],
    };
}

/**
 * @description 根据初始点经纬, 已知点经纬, 求出其他方位的经纬度
 * @param initialLatLng {number[]} 初始点 示例: [91.011,2.011]
 * @param givenLatLng {number[]} 已知点 示例: [91.011,2.011]
 * @param direction {number} 方向 0表示正北 180表示正南
 * @return {number[]} 指定方位经纬度
 * */
export function getTargetLatLng(
    initialLatLng: any,
    givenLatLng: any,
    direction = 0
): number[] {
    // 计算两点间的距离
    const distance = Distance(initialLatLng, givenLatLng, { units: 'degrees' });

    // 根据开始点,距离,方向,求出目标点
    const destination = Destination(initialLatLng, distance, direction, {
        units: 'degrees',
    });
    return [
        destination.geometry.coordinates[0],
        destination.geometry.coordinates[1],
    ];
}
