import * as Cesium from 'cesium';

import { BaseDraw } from './BaseDraw';
import { DrawMode, DrawResult } from '../DrawManager';
import { defaultDrawStyle, DrawStyle } from './DrawStyles';

/**
 * 线绘制类
 */
export class LineDraw extends BaseDraw {
    private style: DrawStyle;

    constructor(viewer: Cesium.Viewer, style: Partial<DrawStyle> = {}) {
        super(viewer);
        this.style = { ...defaultDrawStyle, ...style };
    }

    /**
     * 开始绘制线
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
                            '<p>单击继续，右键结束</p>'
                        );
                        if (this.positions.length === 0) {
                            this.positions.push(cartesian);
                            this.positions.push(cartesian.clone());
                        } else {
                            this.positions[this.positions.length - 1] =
                                cartesian;
                        }
                        this.updateLineEntity();
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
                            '<p>单击继续，右键结束</p>'
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
                if (this.positions.length < 2) return;

                // 完成绘制
                const result: DrawResult = {
                    entity: this.tempEntity!,
                    positions: [...this.positions],
                    mode: DrawMode.Line,
                };

                // 清理事件并返回结果
                this.tooltip.setVisible(false);
                this.removeEventHandlers();
                resolve(result);
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        });
    }

    /**
     * 更新线实体
     */
    private updateLineEntity(): void {
        this.clearTempEntity();

        if (this.positions.length < 2) return;

        // 使用CallbackProperty实现动态更新
        const positionsCallback = new Cesium.CallbackProperty(() => {
            return this.positions;
        }, false);

        this.tempEntity = this.viewer.entities.add({
            polyline: {
                positions: positionsCallback,
                width: this.style.lineWidth,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.2,
                    color: this.style.outlineColor,
                }),
                clampToGround: true,
                classificationType: Cesium.ClassificationType.BOTH,
            },
        });
    }
}
