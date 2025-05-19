import { Subject } from 'rxjs';

export interface MoveEventObs {
    screenPosition: typeof Cesium.Cartesian2;
    position: typeof Cesium.Cartesian3;
}

/**
 * 计算层级
 * */
export function altitudeToZoom(altitude) {
    const A = 40487.57;

    const B = 0.00007096758;

    const C = 91610.74;

    const D = -40467.74;

    return D + (A - D) / (1 + Math.pow(altitude / C, B));
}

export function getCameraPosition(viewer: typeof Cesium.Viewer) {
    const camera = viewer.scene.camera;

    // 获取相机视角的中心位置
    const center = camera.pickEllipsoid(
        new Cesium.Cartesian2(viewer.canvas.clientWidth / 2.0, viewer.canvas.clientHeight / 2.0)
    );

    // 如果中心位置不是undefined，则打印到控制台
    if (Cesium.defined(center)) {
        const superMapCenter = Cesium.Cartographic.fromCartesian(center);
        const cameraPosition = Cesium.Cartographic.fromCartesian(viewer.scene.camera.position);
        const point = [
            Cesium.Math.toDegrees(superMapCenter.latitude),
            Cesium.Math.toDegrees(superMapCenter.longitude)
        ];
        let zoom = altitudeToZoom(cameraPosition.height);
        zoom = zoom - 2;
        return { zoom, point };
    }
    return { zoom: 18, point: [] };
}

/**
 * cesium 摄像头移动事件处理
 * 获取camera视角范围坐标
 * 返回坐标分别为，左上，右上，右下，左下
 * @param viewer
 */
export function setupMoveEvent(viewer: typeof Cesium.Viewer) {
    const subject = new Subject<any>();

    viewer.camera.moveEnd.addEventListener(() => {
        const data = getCameraPosition(viewer);
        subject.next(data);
    });
    viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(evt) {
        const data = getCameraPosition(viewer);
        subject.next(data);
    }, Cesium.ScreenSpaceEventType.WHEEL);

    return subject;
}
