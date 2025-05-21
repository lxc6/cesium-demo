import * as Cesium from 'cesium';

import { BaseDraw } from './BaseDraw';
import { DrawMode, DrawResult } from '../DrawManager';
import { defaultDrawStyle, DrawStyle } from './DrawStyles';

/**
 * 矩形绘制类
 */
export class RectangleDraw extends BaseDraw {
    private style: DrawStyle;

    constructor(viewer: Cesium.Viewer, style: Partial<DrawStyle> = {}) {
        super(viewer);
        this.style = { ...defaultDrawStyle, ...style };
    }

    /**
     * 开始绘制矩形
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
                            '<p>拖动鼠标绘制矩形，单击完成</p>'
                        );
                        if (this.positions.length === 0) {
                            this.positions.push(cartesian);
                            this.positions.push(cartesian.clone());
                        } else {
                            this.positions[this.positions.length - 1] =
                                cartesian;
                        }
                        this.updateRectangleEntity();
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
                            '<p>拖动鼠标绘制矩形，单击完成</p>'
                        );
                        this.positions.push(cartesian);
                        this.positions.push(cartesian.clone());
                    } else if (this.positions.length === 2) {
                        // 完成绘制
                        const result: DrawResult = {
                            entity: this.tempEntity!,
                            positions: [...this.positions],
                            mode: DrawMode.Rectangle,
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
                    mode: DrawMode.Rectangle,
                });
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        });
    }

    /**
     * 更新矩形实体
     */
    private updateRectangleEntity(): void {
        this.clearTempEntity();

        if (this.positions.length < 2) return;

        // 使用CallbackProperty实现动态更新
        const rectangleCoordinatesCallback = new Cesium.CallbackProperty(() => {
            return Cesium.Rectangle.fromCartesianArray(this.positions);
        }, false);

        this.tempEntity = this.viewer.entities.add({
            rectangle: {
                coordinates: rectangleCoordinatesCallback,
                material: this.style.fillColor,
                outline: true,
                outlineColor: this.style.outlineColor,
                outlineWidth: this.style.outlineWidth,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        });
    }
}