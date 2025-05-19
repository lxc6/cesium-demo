import { Points, stringToOtherFormatLatLng } from '@/cesium';

export function calculateCartesian3Array(pointsArray: Points[]) {
    const newPointArray: number[] = [];
    pointsArray.forEach((point) => {
        newPointArray.push(point.x);
        newPointArray.push(point.y);
        newPointArray.push(1);
    });
    return newPointArray;
}

export function highlightLine(
    pointsArray: Points[],
    viewer: typeof Cesium.Viewer
) {
    const newPointsArray = calculateCartesian3Array(pointsArray);
    return viewer.entities.add({
        polyline: {
            positions:
                Cesium.Cartesian3.fromDegreesArrayHeights(newPointsArray),
            width: 10,
            material: Cesium.Color.fromAlpha(Cesium.Color.ORANGE, 0.5),
            clampToGround: true, // 设置为 true，使线贴地
        },
    });
}

export function highlightPolygon(
    pointsArray: Points[],
    viewer: typeof Cesium.Viewer
) {
    const newPointsArray = calculateCartesian3Array(pointsArray);
    return viewer.entities.add({
        polygon: {
            hierarchy: new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArrayHeights(newPointsArray)
            ),
            material: Cesium.Color.ORANGE.withAlpha(0.5),
            classificationType: Cesium.ClassificationType.BOTH,
        },
    });
}

export function identificationLabel(
    labelPosition,
    viewer: typeof Cesium.Viewer,
    text: string
) {
    const height = labelPosition.z ? labelPosition.z : 0;
    viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
            labelPosition.x,
            labelPosition.y,
            height
        ),
        label: {
            text,
            font: '24px Helvetica',
            style: Cesium.LabelStyle.FILL,
            fillColor: Cesium.Color.WHITE,
            backgroundColor: Cesium.Color.CADETBLUE,
            showBackground: true,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            disableDepthTestDistance: 10000.0,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                10000
            ),
            // eyeOffset: new Cesium.Cartesian3(0.0, 1.0, -10.0)
        },
    });
}

// 相机飞到选中的管线设施
export function setCesiumCameraView(
    rawCoordinates,
    viewer: typeof Cesium.Viewer
) {
    const { coordinateArr } = stringToOtherFormatLatLng(rawCoordinates);
    viewer.scene.camera.flyTo(
        {
            destination: Cesium.Cartesian3.fromDegrees(...coordinateArr),
            // orientation: {
            //   heading: Cesium.Math.toRadians(35.0),
            //   pitch: Cesium.Math.toRadians(-30.0),
            //   roll: 0.0
            // }
        },
        { duration: 1 }
    );
    viewer.scene.camera.zoomOut(12);
}
