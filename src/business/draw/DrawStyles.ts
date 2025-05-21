import * as Cesium from 'cesium';

/**
 * 绘制样式配置
 */
export interface DrawStyle {
    fillColor: Cesium.Color;
    outlineColor: Cesium.Color;
    outlineWidth: number;
    pointSize: number;
    lineWidth: number;
}

/**
 * 默认绘制样式
 */
export const defaultDrawStyle: DrawStyle = {
    fillColor: Cesium.Color.fromCssColorString('#3388ff').withAlpha(0.4),
    outlineColor: Cesium.Color.fromCssColorString('#3388ff'),
    outlineWidth: 2,
    pointSize: 12,
    lineWidth: 4,
};