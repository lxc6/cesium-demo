// /**
//  * 用于开发中的测试函数。
//  * 生产环境不会产生效果
//  */
// import { Print } from '@tvp/util';
// import { Position } from '@turf/turf';

// const isDev = process.env['NX_TASK_TARGET_CONFIGURATION'] !== 'production';

// /**
//  * 指定经纬度的高度0地区打点
//  * @param viewer
//  * @param position
//  */
// export function testDrawPoint(
//     viewer: Cesium.Viewer,
//     position: [number, number] | Position
// ) {
//     if (!isDev) return;
//     Print.Info('当前绘制点位： ', position);

//     const pointOptions = {
//         show: true, // 是否展示
//         pixelSize: 20, // 点的大小
//         // heightReference:HeightReference.NONE,//相对高度
//         color: Cesium.Color.RED, // 颜色
//         outlineColor: Cesium.Color.SKYBLUE, // 边框颜色
//         outlineWidth: 3, // 边框宽度
//         // scaleByDistance:new Cesium.NearFarScalar(100, 5, 10000, 15), //缩放距离设置
//         // translucencyByDistance:new Cesium.NearFarScalar(100, 0.2, 10000, 0.8),//点的半透明设置
//         // distanceDisplayCondition:new Cesium.DistanceDisplayCondition(1000, 10000),//点的显隐距离
//         // disableDepthTestDistance:5000000,//禁用深度测试距离
//     };
//     return viewer.entities.add({
//         position: Cesium.Cartesian3.fromDegrees(...position),
//         point: pointOptions,
//     });
// }
