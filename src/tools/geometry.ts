/**
 *  ---------------------------geometry.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    geometry的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/5/17
 *  @Param
 *  @Return
 *  @File           libs/utility/src/lib/cesium/tools
 *  @Update         [time:user] 某用户更新此文件
 * */
// import { DrawLine } from '../controller';
import { courseAngle } from './coordinate';

export function createPlane(
    planeModelMatrix: typeof Cesium.Matrix4,
    color: typeof Cesium.Color
): (typeof Cesium.Primitive)[] {
    // 创建平面
    const planeGeometry = new Cesium.PlaneGeometry({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
    });

    // 创建平面外轮廓
    const planeOutlineGeometry = new Cesium.PlaneOutlineGeometry({});

    const planeGeometryInstance = new Cesium.GeometryInstance({
        geometry: planeGeometry,
        modelMatrix: planeModelMatrix,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
        },
    });

    const plane = new Cesium.Primitive({
        geometryInstances: planeGeometryInstance,
        appearance: new Cesium.PerInstanceColorAppearance({
            closed: false,
        }),
    });

    const planeOutlineGeometryInstance = new Cesium.GeometryInstance({
        geometry: planeOutlineGeometry,
        modelMatrix: planeModelMatrix,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.ALICEBLUE
            ),
        },
    });

    const planeOutline = new Cesium.Primitive({
        geometryInstances: planeOutlineGeometryInstance,
        appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            renderState: {
                lineWidth: 10,
            },
        }),
    });

    return [plane, planeOutline];
}

export function generateBoxFromLine(
    start: typeof Cesium.Cartesian3,
    end: typeof Cesium.Cartesian3,
    geometryHeight = 30,
    width = 0.1
) {
    // 线段中点
    const midpoint = DrawLine.midPoint(start, end);
    // 转经纬度
    const cartographic = Cesium.Cartographic.fromCartesian(midpoint);

    // 线段长度
    const distance = Cesium.Cartesian3.distance(start, end);
    // 创建一个长度为线段，厚度为0.1，高度为geometryHeight的box
    const geometry = new Cesium.GeoBox(distance, width, geometryHeight);

    // 将boxZ轴与线段保持一致
    geometry.geoRotationZ = courseAngle(start, end) - 90;
    geometry.geoPosition = new Cesium.Point3D(
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
        -(geometryHeight / 2) // 项目中没有地形，暂时置固定值
    );

    return geometry;
}
