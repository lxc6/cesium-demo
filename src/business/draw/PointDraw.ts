import * as Cesium from 'cesium';

import { BaseDraw } from './BaseDraw';
import { DrawMode, DrawResult } from '../DrawManager';
import { defaultDrawStyle, DrawStyle } from './DrawStyles';

/**
 * 点绘制类
 */
export class PointDraw extends BaseDraw {
    private style: DrawStyle;

    constructor(viewer: Cesium.Viewer, style: Partial<DrawStyle> = {}) {
        super(viewer);
        this.style = { ...defaultDrawStyle, ...style };
    }

    /**
     * 开始绘制点
     */
    start(): Promise<DrawResult> {
        return new Promise((resolve) => {
            // 设置鼠标移动事件
            this.handler.setInputAction(
                (event: { endPosition: Cesium.Cartesian2 }) => {
                    // this.tooltip.showAt(
                    //     event.endPosition,
                    //     '<p>单击鼠标左键确定点位置</p>'
                    // );
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

                    // 创建点实体
                    this.positions = [cartesian];
                    this.createPointEntity();

                    // 完成绘制
                    const result: DrawResult = {
                        entity: this.tempEntity!,
                        positions: [...this.positions],
                        mode: DrawMode.Point,
                    };

                    // 清理事件并返回结果
                    // this.tooltip.setVisible(false);
                    this.removeEventHandlers();
                    resolve(result);
                },
                Cesium.ScreenSpaceEventType.LEFT_CLICK
            );
        });
    }

    /**
     * 创建点实体
     */
    private createPointEntity(): void {
        this.clearTempEntity();

        if (this.positions.length < 1) return;

        this.tempEntity = this.viewer.entities.add({
            position: this.positions[0],
            point: {
                pixelSize: this.style.pointSize,
                color: this.style.outlineColor,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 1,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
    }
}
