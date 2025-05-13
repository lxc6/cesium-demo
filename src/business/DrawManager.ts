import {
    createTooltip,
    getTargetLatLng,
    MouseTooltip,
    screenCoordinatesToDegrees,
    screenToTerrainGraphical,
    toRectangleLonLat,
} from '../tools/index';

export enum DrawMode {
    Point = 'Point',
    Line = 'Line',
    Polygon = 'Polygon',
    Rectangle = 'Rectangle',
    Circle = 'Circle',
}
export interface DrawResult {
    entity: Cesium.Entity;
    positions: Cesium.Cartesian3[];
    mode: DrawMode;
}

export type DrawCompleteCallback = (result: DrawResult) => void;

export class DrawManager {
    private viewer: Cesium.Viewer;
    private handler: Cesium.ScreenSpaceEventHandler;
    private drawingMode: DrawMode | null = null;
    private positions: Cesium.Cartesian3[] = [];
    private tempEntity: Cesium.Entity | null = null;
    private drawCompleteCallback: DrawCompleteCallback | null = null;
    private tooltip: MouseTooltip;
    private moveStatus = false;
    private entities: Cesium.Entity[] = [];

    constructor(viewer: Cesium.Viewer) {
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(
            this.viewer.scene.canvas
        );
        this.tooltip = createTooltip(
            this.viewer.container.firstElementChild as HTMLDivElement
        );
        this.setupKeyboardEventHandlers();
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    /**
     * 开始绘制
     * @param mode 绘制模式
     */
    startDraw(mode: DrawMode, callback?: DrawCompleteCallback): void {
        this.drawCompleteCallback = callback || null;
        this.drawingMode = mode;
        this.positions = [];
        this.clearTempEntity();
        this.setupEventHandlers();
    }

    /**
     * 停止绘制
     */
    stopDraw(): void {
        this.drawingMode = null;
        this.positions = [];
        this.clearTempEntity();
        this.removeEventHandlers();
    }

    /**
     * 设置事件处理器
     */
    private setupEventHandlers(): void {
        // 鼠标移动事件
        this.handler.setInputAction(
            (event: { endPosition: Cesium.Cartesian2 }) => {
                if (!this.drawingMode) return;

                const cartesian = this.getCartesianFromScreenPoint(
                    event.endPosition
                );
                if (!cartesian) return;

                if (!this.moveStatus) {
                    this.tooltip.showAt(
                        event.endPosition,
                        '<p>请单击鼠标左键开始绘制</p>'
                    );
                } else {
                    this.tooltip.showAt(
                        event.endPosition,
                        '<p>请单击鼠标右键结束绘制</p>'
                    );
                    if (this.positions.length === 0) {
                        this.positions.push(cartesian);
                        this.positions.push(cartesian.clone());
                    } else {
                        this.positions[this.positions.length - 1] = cartesian;
                    }
                    this.updateTempEntity();
                }
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );

        // 鼠标左键点击事件
        this.handler.setInputAction(
            (event: { position: Cesium.Cartesian2 }) => {
                if (!this.drawingMode) return;

                const cartesian = this.getCartesianFromScreenPoint(
                    event.position
                );
                if (!cartesian) return;

                if (this.drawingMode === DrawMode.Point) {
                    this.positions = [cartesian];
                    this.finishDrawing();
                    return;
                }

                if (!this.moveStatus) {
                    this.moveStatus = true;
                    this.tooltip.showAt(
                        event.position,
                        '<p>请拖动鼠标绘制区域范围</p>'
                    );
                    if (
                        this.drawingMode === DrawMode.Rectangle ||
                        this.drawingMode === DrawMode.Circle
                    ) {
                        this.positions[0] = cartesian;
                        this.positions.push(cartesian.clone());
                    } else {
                        this.positions.push(cartesian);
                    }
                } else if (
                    this.drawingMode === DrawMode.Rectangle ||
                    this.drawingMode === DrawMode.Circle
                ) {
                    if (this.positions.length === 2) {
                        this.finishDrawing();
                    }
                } else {
                    this.positions.push(cartesian);
                }
            },
            Cesium.ScreenSpaceEventType.LEFT_CLICK
        );

        // 鼠标右键点击事件 - 完成绘制
        this.handler.setInputAction(() => {
            if (!this.drawingMode) return;
            this.finishDrawing();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 移除事件处理器
     */
    private removeEventHandlers(): void {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 从屏幕坐标获取世界坐标
     */
    private getCartesianFromScreenPoint(
        screenPoint: Cesium.Cartesian2
    ): Cesium.Cartesian3 | undefined {
        const { cartesian } = screenCoordinatesToDegrees(
            this.viewer,
            screenPoint
        );
        return cartesian;
    }

    /**
     * 更新临时实体
     */
    private updateTempEntity(): void {
        this.clearTempEntity();

        if (!this.drawingMode) return;
        if (this.drawingMode === DrawMode.Point && this.positions.length < 1)
            return;
        if (this.drawingMode !== DrawMode.Point && this.positions.length < 2)
            return;

        const defaultStyle = {
            fillColor:
                Cesium.Color.fromCssColorString('#3388ff').withAlpha(0.4),
            outlineColor: Cesium.Color.fromCssColorString('#3388ff'),
            outlineWidth: 2,
            pointSize: 8,
            lineWidth: 3,
        };

        switch (this.drawingMode) {
            case DrawMode.Point:
                this.tempEntity = this.viewer.entities.add({
                    position: this.positions[0],
                    point: {
                        pixelSize: defaultStyle.pointSize,
                        color: defaultStyle.outlineColor,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    },
                });
                break;

            case DrawMode.Line:
                this.tempEntity = this.viewer.entities.add({
                    polyline: {
                        positions: new Cesium.CallbackProperty(() => {
                            return this.positions;
                        }, false),
                        width: defaultStyle.lineWidth,
                        material: defaultStyle.outlineColor,
                        clampToGround: true,
                    },
                });
                break;

            case DrawMode.Polygon:
                this.tempEntity = this.viewer.entities.add({
                    polygon: {
                        hierarchy: new Cesium.CallbackProperty(() => {
                            return new Cesium.PolygonHierarchy(this.positions);
                        }, false),
                        material: defaultStyle.fillColor,
                        outline: true,
                        outlineColor: defaultStyle.outlineColor,
                        outlineWidth: defaultStyle.outlineWidth,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    },
                });
                break;

            case DrawMode.Rectangle:
                this.tempEntity = this.viewer.entities.add({
                    rectangle: {
                        coordinates: new Cesium.CallbackProperty(() => {
                            return Cesium.Rectangle.fromCartesianArray(
                                this.positions
                            );
                        }, false),
                        material: defaultStyle.fillColor,
                        outline: true,
                        outlineColor: defaultStyle.outlineColor,
                        outlineWidth: defaultStyle.outlineWidth,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    },
                });
                break;

            case DrawMode.Circle:
                const center = this.positions[0];
                const radius = Cesium.Cartesian3.distance(
                    center,
                    this.positions[1]
                );
                this.tempEntity = this.viewer.entities.add({
                    position: center,
                    ellipse: {
                        semiMinorAxis: radius,
                        semiMajorAxis: radius,
                        material: defaultStyle.fillColor,
                        outline: true,
                        outlineColor: defaultStyle.outlineColor,
                        outlineWidth: defaultStyle.outlineWidth,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    },
                });
                break;
        }
    }

    /**
     * 清除临时实体
     */
    private clearTempEntity(): void {
        if (this.tempEntity) {
            this.viewer.entities.remove(this.tempEntity);
            this.tempEntity = null;
        }
    }

    private clearAllEntities(): void {
        this.entities.forEach((entity) => {
            this.viewer.entities.remove(entity);
        });
        this.entities = [];
    }

    /**
     * 完成绘制
     */
    private finishDrawing(): void {
        if (!this.drawingMode) return;
        if (this.drawingMode === DrawMode.Point && this.positions.length < 1)
            return;
        if (this.drawingMode !== DrawMode.Point && this.positions.length < 2)
            return;

        // 保存最终图形
        this.updateTempEntity();

        // 确保实体被正确创建
        if (!this.tempEntity) return;

        // 将临时实体添加到实体列表中
        const finalEntity = this.tempEntity;
        this.entities.push(finalEntity);

        // 如果有回调函数，则调用
        if (this.drawCompleteCallback) {
            const result: DrawResult = {
                entity: finalEntity,
                positions: [...this.positions],
                mode: this.drawingMode,
            };
            this.drawCompleteCallback(result);
        }

        // 重置状态以准备下一次绘制，但保持绘制模式和实体
        this.moveStatus = false;
        this.positions = [];
        this.tooltip.setVisible(false);
        // 清除临时实体引用，但不从viewer中移除
        this.tempEntity = null;

        // 保持事件处理器以支持连续绘制
        // 重新显示初始提示
        this.tooltip.showAt(event.position, '<p>请单击鼠标左键开始绘制</p>');
    }

    /**
     * 销毁管理器
     */
    private setupKeyboardEventHandlers(): void {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (this.drawingMode) {
                    this.stopDraw();
                    this.tooltip.setVisible(false);
                    this.moveStatus = false;
                }
                this.clearAllEntities();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        this._handleKeyDown = handleKeyDown;
    }

    private _handleKeyDown: ((event: KeyboardEvent) => void) | null = null;

    destroy(): void {
        this.stopDraw();
        this.handler.destroy();
        if (this._handleKeyDown) {
            document.removeEventListener('keydown', this._handleKeyDown);
        }
        if (this.snapPointEntity) {
            this.viewer.entities.remove(this.snapPointEntity);
        }
        this.tooltip.destroy();
    }
}
