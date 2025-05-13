// import { ThreeDimensionalContextService } from '@tvp/utility/cesium';

/**
 * 设置飞行预览模式
 * */

export enum PreviewType {
    free,
    flight,
    walk,
}

interface FlyParams {
    duration: number;
    direction: number;
    currentIndex: number;
    flyHeight: number;
    pitch: number;
}

export class FlightPreview {
    drawLineResult: (typeof Cesium.Cartesian3)[] = [];

    // 飞行参数设置
    flyParams: FlyParams = {
        duration: 3,
        direction: 0,
        currentIndex: 0,
        flyHeight: 50,
        pitch: -45,
    };

    destination: typeof Cesium.Cartesian3.fromDegrees;

    flightParams;

    cameraModel;

    drawHandle: typeof Cesium.DrawHandler;

    // ThreeDimensionalContextService.Instance.viewer

    /**
     * 视角飞行
     * */
    goToNextPoint() {
        if (this.flyParams.currentIndex >= this.drawLineResult.length) {
            this.flyParams.currentIndex = 0;
            this.flyParams.direction = 0;
            return;
        }
        const nextPoint = this.drawLineResult[this.flyParams.currentIndex];
        const prePoint = this.drawLineResult[this.flyParams.currentIndex - 1];
        const startPoint = this.drawLineResult[this.flyParams.currentIndex];
        const endPoint = this.drawLineResult[this.flyParams.currentIndex + 1];
        const direction = this.getDirection(prePoint, startPoint);
        const nextDirection = this.getDirection(startPoint, endPoint);
        this.destination = Cesium.Cartesian3.fromDegrees(
            nextPoint.lng,
            nextPoint.lat,
            this.flyParams.flyHeight
        );
        this.flightParams = {
            destination: this.destination,
            duration: this.flyParams.duration,
            orientation: {
                heading: Cesium.Math.toRadians(direction || nextDirection),
                pitch: Cesium.Math.toRadians(this.flyParams.pitch),
                roll: 0.0,
            },
            complete: () => {
                this.flyParams.currentIndex++;
                this.flightParams = {
                    destination: this.destination,
                    duration: 1,
                    orientation: {
                        heading: Cesium.Math.toRadians(
                            nextDirection || nextDirection
                        ),
                        pitch: Cesium.Math.toRadians(this.flyParams.pitch),
                        roll: 0.0,
                    },
                    complete: () => {
                        this.goToNextPoint();
                    },
                };
                this.cameraModel.flyTo(this.flightParams);
            },
        };
        // 创建相机飞行动画
        this.cameraModel =
            ThreeDimensionalContextService.Instance.viewer.scene.camera;
        this.cameraModel.flyTo(this.flightParams);
    }

    /**
     * 计算线段的角度
     * @param startPoint 起点
     * @param endPoint 终点
     * */
    getDirection(startPoint, endPoint): number {
        if (startPoint && endPoint) {
            const start = Cesium.Cartographic.fromDegrees(
                startPoint.lng,
                startPoint.lat
            );
            const end = Cesium.Cartographic.fromDegrees(
                endPoint.lng,
                endPoint.lat
            );
            // 创建EllipsoidGeodesic对象，并设置起点和终点
            const geodesic = new Cesium.EllipsoidGeodesic(start, end);
            // 获取起点到终点的方向（弧度）
            const radian = geodesic.startHeading;
            this.flyParams.direction = Cesium.Math.toDegrees(radian);
        }
        return this.flyParams.direction;
    }

    /**
     * 绘制线段
     * */
    doExecute() {
        const viewer = ThreeDimensionalContextService.Instance.viewer;
        this.drawHandle = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Line);
        this.drawHandle.activeEvt.addEventListener(function (isActive) {
            if (isActive == true) {
                viewer.enableCursorStyle = false;
                viewer._element.style.cursor = '';
            } else {
                viewer.enableCursorStyle = true;
            }
        });
        // handler.movingEvt.addEventListener(function (windowPosition) {
        //     console.log('windowPosition', windowPosition);
        // });
        // 绘制完成的结果
        this.drawHandle.drawEvt.addEventListener((result) => {
            this.drawLineResult = result.positions.map(
                (item: typeof Cesium.Cartesian3) => {
                    const lngLat = Cesium.Cartographic.fromCartesian(item);
                    return {
                        lng: Cesium.Math.toDegrees(lngLat.longitude),
                        lat: Cesium.Math.toDegrees(lngLat.latitude),
                    };
                }
            );
        });
        this.drawHandle.activate();
    }

    /**
     * 暂停
     * */
    pause() {
        this.cameraModel.cancelFlight();
    }

    /*
     * 继续飞行
     * */
    continue() {
        // 可以选择重新设置飞行目标位置
        // flightParams.destination = newDestination;
        this.cameraModel.flyTo(this.flightParams);
    }

    /**
     * 停止飞行
     * */
    stop() {
        this.flyParams.currentIndex = 0;
        this.flyParams.direction = 0;
        const startPoint = this.drawLineResult[0];
        const endPoint = this.drawLineResult[1];
        const nextDirection = this.getDirection(startPoint, endPoint);
        this.cameraModel.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                startPoint.lng,
                startPoint.lat,
                this.flyParams.flyHeight
            ),
            duration: this.flyParams.duration,
            orientation: {
                heading: Cesium.Math.toRadians(nextDirection),
                pitch: Cesium.Math.toRadians(this.flyParams.pitch),
                roll: 0.0,
            },
        });
    }

    destroy() {
        ThreeDimensionalContextService.isClickModel = true;
        this.flyParams.currentIndex = 0;
        this.flyParams.direction = 0;
        this.drawHandle && this.drawHandle.clear();
    }
}

export const flyPreview = new FlightPreview();
