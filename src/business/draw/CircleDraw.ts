import * as Cesium from 'cesium';

import { BaseDraw } from './BaseDraw';
import { DrawMode, DrawResult } from '../DrawManager';
import { defaultDrawStyle, DrawStyle } from './DrawStyles';

/**
 * 圆形绘制类
 */
export class CircleDraw extends BaseDraw {
    private style: DrawStyle;

    constructor(viewer: Cesium.Viewer, style: Partial<DrawStyle> = {}) {
        super(viewer);
        this.style = { ...defaultDrawStyle, ...style };
    }

    /**
     * 开始绘制圆形
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
                            '<p>单击鼠标左键确定圆心</p>'
                        );
                    } else {
                        this.tooltip.showAt(
                            event.endPosition,
                            '<p>拖动鼠标确定半径，单击完成</p>'
                        );
                        if (this.positions.length === 0) {
                            this.positions.push(cartesian);
                            this.positions.push(cartesian.clone());
                        } else {
                            this.positions[this.positions.length - 1] =
                                cartesian;
                        }
                        this.updateCircleEntity();
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
                            '<p>拖动鼠标确定半径，单击完成</p>'
                        );
                        this.positions.push(cartesian);
                        this.positions.push(cartesian.clone());
                    } else if (this.positions.length === 2) {
                        // 完成绘制
                        const result: DrawResult = {
                            entity: this.tempEntity!,
                            positions: [...this.positions],
                            mode: DrawMode.Circle,
                        };

                        // 清理事件并返回结果
                        this.tooltip.setVisible(false);
                        this.removeEventHandlers();
                        resolve(result);
                    }
                },
                Cesium.ScreenSpaceEventType.LEFT_CLICK
            );

            // 设置鼠标右键点击事件 - 取消绘制
            this.handler.setInputAction(() => {
                this.tooltip.setVisible(false);
                this.removeEventHandlers();
                this.clearTempEntity();
                resolve({
                    entity: null as any,
                    positions: [],
                    mode: DrawMode.Circle,
                });
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        });
    }

    /**
     * 更新圆形实体
     */
    private updateCircleEntity(): void {
        this.clearTempEntity();

        if (this.positions.length < 2) return;

        // 使用CallbackProperty实现动态更新
        const positionCallback = new Cesium.CallbackProperty(() => {
            return this.positions[0];
        }, false);

        const radiusCallback = new Cesium.CallbackProperty(() => {
            const center = this.positions[0];
            const radiusPoint = this.positions[1];
            return Cesium.Cartesian3.distance(center, radiusPoint);
        }, false);

        this.tempEntity = this.viewer.entities.add({
            position: positionCallback,
            ellipse: {
                semiMinorAxis: radiusCallback,
                semiMajorAxis: radiusCallback,
                material: this.style.fillColor,
                outline: true,
                outlineColor: this.style.outlineColor,
                outlineWidth: this.style.outlineWidth,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        });
    }
}