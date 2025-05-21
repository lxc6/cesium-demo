import * as Cesium from 'cesium';

import { BaseDraw } from './BaseDraw';
import { DrawMode, DrawResult } from '../DrawManager';
import { defaultDrawStyle, DrawStyle } from './DrawStyles';

/**
 * 多边形绘制类
 */
export class PolygonDraw extends BaseDraw {
    private style: DrawStyle;

    constructor(viewer: Cesium.Viewer, style: Partial<DrawStyle> = {}) {
        super(viewer);
        this.style = { ...defaultDrawStyle, ...style };
    }

    /**
     * 开始绘制多边形
     */
    start(): Promise<DrawResult> {
        return new Promise((resolve) => {
            // 设置鼠标移动事件
            this.handler.setInputAction(
                (event: { endPosition: Cesium.Cartesian2 }) => {
                    const cartesian = this.getCartesianFromScreenPoint(
                        event.endPosition
                    );
                    if (!cartesian) return;

                    if (!this.moveStatus) {
                        this.tooltip.showAt(
                            event.endPosition,
                            '<p>单击鼠标左键开始绘制</p>'
                        );
                    } else {
                        this.tooltip.showAt(
                            event.endPosition,
                            '<p>单击继续，右键闭合</p>'
                        );
                        if (this.positions.length === 0) {
                            this.positions.push(cartesian);
                            this.positions.push(cartesian.clone());
                        } else {
                            this.positions[this.positions.length - 1] =
                                cartesian;
                        }
                        this.updatePolygonEntity();
                    }
                },
                Cesium.ScreenSpaceEventType.MOUSE_MOVE
            );

            // 设置鼠标左键点击事件
            this.handler.setInputAction(
                (event: { position: Cesium.Cartesian2 }) => {
                    const cartesian = this.getCartesianFromScreenPoint(
                        event.position
                    );
                    if (!cartesian) return;

                    if (!this.moveStatus) {
                        this.moveStatus = true;
                        this.tooltip.showAt(
                            event.position,
                            '<p>单击继续，右键闭合</p>'
                        );
                        this.positions.push(cartesian);
                    } else {
                        // 添加新点
                        this.positions.push(cartesian);
                    }
                },
                Cesium.ScreenSpaceEventType.LEFT_CLICK
            );

            // 设置鼠标右键点击事件 - 完成绘制
            this.handler.setInputAction(() => {
                if (this.positions.length < 3) return;

                // 完成绘制
                const result: DrawResult = {
                    entity: this.tempEntity!,
                    positions: [...this.positions],
                    mode: DrawMode.Polygon,
                };

                // 清理事件并返回结果
                this.tooltip.setVisible(false);
                this.removeEventHandlers();
                resolve(result);
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        });
    }

    /**
     * 更新多边形实体
     */
    private updatePolygonEntity(): void {
        this.clearTempEntity();

        if (this.positions.length < 3) return;

        // 使用CallbackProperty实现动态更新
        const hierarchyCallback = new Cesium.CallbackProperty(() => {
            return new Cesium.PolygonHierarchy(this.positions);
        }, false);

        const polylinePositionsCallback = new Cesium.CallbackProperty(() => {
            if (this.positions.length < 3) {
                return [
                    ...this.positions,
                    this.positions[this.positions.length - 1],
                ];
            }
            return [...this.positions, this.positions[0]];
        }, false);

        this.tempEntity = this.viewer.entities.add({
            polygon: {
                hierarchy: hierarchyCallback,
                material: this.style.fillColor,
                outline: true,
                outlineColor: this.style.outlineColor,
                outlineWidth: this.style.outlineWidth,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                perPositionHeight: false,
                classificationType: Cesium.ClassificationType.BOTH,
            },
            polyline: {
                positions: polylinePositionsCallback,
                material: this.style.outlineColor,
                width: this.style.lineWidth,
                clampToGround: true,
            },
        });
    }
}