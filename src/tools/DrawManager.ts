export enum DrawMode {
    Point = 'Point',
    Line = 'Line',
    Polygon = 'Polygon',
    Rectangle = 'Rectangle',
    Circle = 'Circle',
}

export class DrawManager {
    private viewer: Cesium.Viewer;
    private handler: Cesium.ScreenSpaceEventHandler;
    private drawingMode: DrawMode | null = null;
    private positions: Cesium.Cartesian3[] = [];
    private tempEntity: Cesium.Entity | null = null;

    constructor(viewer: Cesium.Viewer) {
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(
            this.viewer.scene.canvas
        );
    }

    /**
     * 开始绘制
     * @param mode 绘制模式
     */
    startDraw(mode: DrawMode): void {
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

                if (this.positions.length === 0) {
                    this.positions.push(cartesian);
                    this.positions.push(cartesian.clone());
                } else {
                    this.positions[this.positions.length - 1] = cartesian;
                }

                this.updateTempEntity();
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

                if (
                    this.drawingMode === DrawMode.Rectangle ||
                    this.drawingMode === DrawMode.Circle
                ) {
                    if (this.positions.length === 2) {
                        this.finishDrawing();
                    } else {
                        this.positions[0] = cartesian;
                        this.positions.push(cartesian.clone());
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
        const ray = this.viewer.camera.getPickRay(screenPoint);
        if (!ray) return undefined;
        return this.viewer.scene.globe.pick(ray, this.viewer.scene);
    }

    /**
     * 更新临时实体
     */
    private updateTempEntity(): void {
        this.clearTempEntity();

        if (!this.drawingMode || this.positions.length < 2) return;

        const entityOptions: { positions: Cesium.Cartesian3[] } = {
            positions: this.positions,
        };

        switch (this.drawingMode) {
            case DrawMode.Rectangle:
                this.tempEntity = this.viewer.entities.add({
                    rectangle: {
                        coordinates: Cesium.Rectangle.fromCartesianArray(
                            this.positions
                        ),
                        material: Cesium.Color.BLUE.withAlpha(0.5),
                        outline: true,
                        outlineColor: Cesium.Color.WHITE,
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
                        material: Cesium.Color.BLUE.withAlpha(0.5),
                        outline: true,
                        outlineColor: Cesium.Color.WHITE,
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

    /**
     * 完成绘制
     */
    private finishDrawing(): void {
        if (!this.drawingMode || this.positions.length < 2) return;

        // 保存最终图形
        this.updateTempEntity();
        this.tempEntity = null;

        // 重置状态
        this.drawingMode = null;
        this.positions = [];
        this.removeEventHandlers();
    }

    /**
     * 销毁管理器
     */
    destroy(): void {
        this.stopDraw();
        this.handler.destroy();
    }
}
