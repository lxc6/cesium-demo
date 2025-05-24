import { Viewer, ScreenSpaceEventHandler, ScreenSpaceEventType, PolygonHierarchy, Color, Entity, Cartesian3 } from 'cesium';

export class ExcavationManager {
    private viewer: Viewer;
    private positions: Cartesian3[] = [];
    private handler: ScreenSpaceEventHandler | null = null;
    private activeEntity: Entity | null = null;

    constructor(viewer: Viewer) {
        this.viewer = viewer;
    }

    startExcavation(depth: number = 10) {
        this.reset();
        this.initHandler(depth);
    }

    private initHandler(depth: number) {
        this.handler = new ScreenSpaceEventHandler(
            this.viewer.scene.canvas
        );

        // 左键点击添加点
        this.handler.setInputAction((event: any) => {
            const cartesian = this.viewer.scene.pickPosition(event.position);
            if (!cartesian) return;

            this.positions.push(cartesian);
            this.updateDrawing();
        }, ScreenSpaceEventType.LEFT_CLICK);

        // 右键完成绘制
        this.handler.setInputAction(async () => {
            if (this.positions.length >= 3) {
                // 执行挖方分析
                this.complete();
            }
        }, ScreenSpaceEventType.RIGHT_CLICK);

        // 鼠标移动时实时更新
        this.handler.setInputAction((event: any) => {
            const cartesian = this.viewer.scene.pickPosition(event.endPosition);
            if (!cartesian && this.positions.length < 1) return;

            const tempPositions = [...this.positions];
            if (cartesian) {
                tempPositions.push(cartesian);
            }
            this.updateDrawing(tempPositions);
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }

    private updateDrawing(positions: Cartesian3[] = this.positions) {
        if (this.activeEntity) {
            this.viewer.entities.remove(this.activeEntity);
        }

        if (positions.length < 1) return;

        this.activeEntity = this.viewer.entities.add({
            polygon: {
                hierarchy: new PolygonHierarchy(positions),
                material: Color.RED.withAlpha(0.5),
            },
        });
    }

    private complete() {
        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
        if (this.activeEntity) {
            this.viewer.entities.remove(this.activeEntity);
            this.activeEntity = null;
        }
        this.positions = [];
    }

    reset() {
        this.complete();
    }

    destroy() {
        this.reset();
    }
}
