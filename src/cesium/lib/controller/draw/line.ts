/**
 *  ---------------------------line.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    line的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/5/18
 *  @Param
 *  @Return
 *  @File           libs/utility/src/lib/cesium/controller/draw
 *  @Update         [time:user] 某用户更新此文件
 * */
import { firstValueFrom } from 'rxjs';
import { DrawBase } from './base';
import { BaseCesiumScene } from '../../baseCesiumScene';

export class DrawLine extends DrawBase<typeof Cesium.PolylineGraphics> {
    static midPoint(point1, point2) {
        const midPoint = new Cesium.Cartesian3();
        Cesium.Cartesian3.add(point1, point2, midPoint);
        Cesium.Cartesian3.divideByScalar(midPoint, 2.0, midPoint);
        return midPoint;
    }

    positions: (typeof Cesium.Cartesian3)[] = [];

    activeShape;

    floatingPoint;

    handler?: typeof Cesium.ScreenSpaceEventHandler;

    constructor(
        override cesiumBase: BaseCesiumScene,
        private options?: {
            maxLength?: number;
        }
    ) {
        super(cesiumBase);
        if (options && options.maxLength) options.maxLength += 1;
    }

    drawLine(positionData: Array<typeof Cesium.Cartesian3>) {
        return this.dataSource.entities.add({
            polyline: {
                positions: positionData,
                material: new Cesium.PolylineGlowMaterialProperty({
                    color: Cesium.Color.DEEPSKYBLUE,
                    // 发光强度
                    glowPower: 0.25
                }),
                clampToGround: true,
                width: 10,
                zIndex: 10
            }
        });
    }

    createPoint(worldPosition) {
        return this.dataSource.entities.add({
            name: 'draw point',
            position: worldPosition,
            point: {
                color: Cesium.Color.ORANGE,
                pixelSize: 10,
                // 该位置固定在地形上
                heightReference: Cesium.HeightReference.NONE
            }
        });
    }

    override start() {
        super.start();
        const handler = new Cesium.ScreenSpaceEventHandler(this.cesiumBase.viewer.scene.canvas);
        const dynamicPositions = new Cesium.CallbackProperty(() => this.positions, false);
        this.activeShape = this.drawLine(dynamicPositions);

        handler.setInputAction(
            this.handleLeftClick.bind(this),
            Cesium.ScreenSpaceEventType.LEFT_CLICK
        );
        handler.setInputAction(this.handleMove.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.handler = handler;
        handler.setInputAction(click => {
            this.terminateShape();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        return firstValueFrom(this.result$.asObservable());
    }

    override destroy() {
        super.destroy();
        this.handler?.destroy();
    }

    handleLeftClick(event) {
        const { viewer } = this.cesiumBase;
        // We use `viewer.scene.globe.pick here instead of `viewer.camera.pickEllipsoid` so that
        // we get the correct point when mousing over terrain.
        const ray = viewer.camera.getPickRay(event.position);
        const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);
        // `earthPosition` will be undefined if our mouse is not over the globe.
        if (Cesium.defined(earthPosition)) {
            if (this.positions.length === 0) {
                this.createPoint(earthPosition);
                this.positions.push(earthPosition);
            }
            this.position$.next(earthPosition);
            this.positions.push(earthPosition);
            this.floatingPoint = this.createPoint(earthPosition);
            if (
                this.options &&
                this.options.maxLength &&
                this.positions.length >= this.options.maxLength
            ) {
                this.terminateShape();
            }
        }
    }

    handleMove(event) {
        const { viewer } = this.cesiumBase;
        const ray = viewer.camera.getPickRay(event.endPosition);
        const newPosition = viewer.scene.globe.pick(ray, viewer.scene);

        this.position$.next(newPosition);
        if (Cesium.defined(this.floatingPoint) && Cesium.defined(newPosition)) {
            this.floatingPoint?.position.setValue(newPosition);
            this.positions.pop();
            this.positions.push(newPosition);
        }
    }

    terminateShape() {
        // this.positions.pop();
        this.cesiumBase.viewer.entities.remove(this.floatingPoint);
        this.result$.next(this.activeShape.polyline);
        this.result$.complete();
        this.floatingPoint = undefined;
        this.handler?.destroy();
    }
}
