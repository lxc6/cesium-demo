import { ellipse } from '@turf/turf';
import {
    createTooltip,
    getTargetLatLng,
    MouseTooltip,
    screenCoordinatesToDegrees,
    screenToTerrainGraphical,
    toRectangleLonLat,
} from '../tools/index';

export enum DrawType {
    Polygon,
    Circle,
}

export interface drawData {
    id: number;
    // 起点屏幕坐标
    startPosition: { left: string; top: string };
    // 集合对象
    geometry: any;
    // 绘制形状
    shape: DrawType;
    // 绘制宽高
    width: number;
    height: number;
    // 视口宽高
    clientW: number;
    clientH: number;
    // image 裁剪位置
    sx: number;
    sy: number;
    // 边界坐标
    boundary: Array<{ lat: number; lng: number }>;
}

export class BaseDraw3D {
    viewer: Cesium.Viewer;

    drawType;

    tooltip: MouseTooltip;

    // 处理用户输入事件
    handler: Cesium.ScreenSpaceEventHandler;

    drawData: drawData = {
        id: new Date().getTime(),
        startPosition: { left: '0', top: '0' },
        geometry: {},
        shape: 0,
        sx: 0,
        sy: 0,
        width: 0,
        height: 0,
        clientW: 0,
        clientH: 0,
        boundary: [],
    };

    moveStatus = false;

    // 绘制实体
    entity;

    // 开始绘制点经纬度
    startLnglat: any = [];

    // 坐标位置
    coordinates;

    // 边界坐标
    westSouthEastNorth;

    constructor(viewer: Cesium.Viewer, drawType: DrawType) {
        this.viewer = viewer;
        this.drawType = drawType;
        this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        this.tooltip = createTooltip(
            <HTMLDivElement>viewer.container.firstElementChild
        );
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    /**
     * 根据绘制类型开始绘制
     * return {Promise<drawData>}
     * */
    start() {
        switch (this.drawType) {
            case DrawType.Polygon:
                return this.drawPolygon();
            case DrawType.Circle:
                return this.drawCircle();
            default:
                return this.drawPolygon();
        }
    }

    /**
     * @description 绘制矩形
     * @
     * */
    drawRectangleFn(): Promise<any> {
        return new Promise((resolve, reject) => {
            let startScreenCoordinate: { x: number; y: number };
            let endScreenCoordinate: { x: number; y: number };
            this.handler.setInputAction((click) => {
                if (!this.moveStatus) {
                    this.tooltip.showAt(
                        click.position,
                        '<p>请拖动鼠标绘制区域范围</p>'
                    );
                    startScreenCoordinate = JSON.parse(
                        JSON.stringify(click.position)
                    );
                    this.startLnglat = screenToTerrainGraphical(
                        this.viewer,
                        click.position
                    );
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        });
    }

    /**
     * @description 矩形绘制
     * return {Promise<drawData>}
     * */
    drawPolygon(): Promise<any> {
        return new Promise((resolve, reject) => {
            let endLngLat: number[] = [];

            let startHeight;
            let endHeight;
            // 左键事件
            this.handler.setInputAction((leftClick) => {
                if (!this.moveStatus) {
                    // this.viewer.scene.screenSpaceCameraController.enableZoom = false;
                    // this.viewer.scene.screenSpaceCameraController.enableTilt = false;
                    const { lngLat, cartographicHeight } =
                        screenCoordinatesToDegrees(
                            this.viewer,
                            leftClick.position
                        );
                    this.startLnglat = lngLat;
                    startHeight = cartographicHeight;

                    this.westSouthEastNorth = this.startLnglat;
                    this.tooltip.showAt(
                        leftClick.position,
                        '<p>请拖动鼠标绘制区域范围</p>'
                    );
                    if (this.startLnglat.length) {
                        this.handler.removeInputAction(
                            Cesium.ScreenSpaceEventType.LEFT_CLICK
                        );
                    }

                    this.entity = this.viewer.entities.add({
                        name: 'rectangle',
                        id: this.drawData.id,
                        rectangle: new Cesium.RectangleGraphics({
                            coordinates: '',
                        }),
                        polygon: {
                            hierarchy: new Cesium.CallbackProperty(() => {
                                return {
                                    positions:
                                        Cesium.Cartesian3.fromDegreesArray(
                                            this.westSouthEastNorth
                                        ),
                                };
                            }),
                            material: Cesium.Color.AQUA.withAlpha(0.5),
                            fill: true,
                            show: true,
                            classificationType: Cesium.ClassificationType.BOTH,
                        },
                        polyline: {
                            positions: new Cesium.CallbackProperty(() => {
                                return Cesium.Cartesian3.fromDegreesArray(
                                    this.westSouthEastNorth
                                );
                            }),
                            material: Cesium.Color.AQUA,
                            width: 2,
                            clampToGround: true,
                            height: 1,
                        },
                    });
                    this.moveStatus = true;
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            //移动事件
            this.handler.setInputAction((move) => {
                if (!this.moveStatus) {
                    this.tooltip.showAt(
                        move.endPosition,
                        '<p>请单击鼠标左键开始绘制区域</p>'
                    );
                } else {
                    this.tooltip.showAt(
                        move.endPosition,
                        '<p>请单击鼠标右键结束绘制</p>'
                    );
                    const { lngLat } = screenCoordinatesToDegrees(
                        this.viewer,
                        move.endPosition
                    );
                    endLngLat = screenCoordinatesToDegrees(
                        this.viewer,
                        move.endPosition
                    );
                    this.westSouthEastNorth = [
                        this.startLnglat[0],
                        this.startLnglat[1],
                        this.startLnglat[0],
                        lngLat[1],
                        lngLat[0],
                        lngLat[1],
                        lngLat[0],
                        this.startLnglat[1],
                        this.startLnglat[0],
                        this.startLnglat[1],
                    ];
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

            //右键事件
            this.handler.setInputAction((event) => {
                // this.viewer.scene.screenSpaceCameraController.enableZoom = true;
                // this.viewer.scene.screenSpaceCameraController.enableTilt = true;
                const { lngLat, cartographicHeight } =
                    screenCoordinatesToDegrees(this.viewer, event.position);
                endLngLat = lngLat;
                endHeight = cartographicHeight;

                this.tooltip.setVisible(false);
                this.handler.destroy();

                const { northwest, southeast } = toRectangleLonLat(
                    this.startLnglat,
                    endLngLat
                );

                const startPosition = this.toScreenCoordinates(
                    northwest,
                    startHeight
                );
                const endPosition = this.toScreenCoordinates(
                    southeast,
                    endHeight
                );

                //获取绘制矩形宽高
                const width = Math.abs(startPosition.x - endPosition.x);
                const height = Math.abs(startPosition.y - endPosition.y);

                // 获取比例尺
                this.drawData = {
                    id: new Date().getTime(),
                    shape: DrawType.Polygon,
                    sx: startPosition.x,
                    sy: startPosition.y,
                    width: width,
                    height: height,
                    clientW: document.body.clientWidth,
                    clientH: document.body.clientHeight,
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [northwest[0], northwest[1]],
                                [northwest[0], southeast[1]],
                                [southeast[0], southeast[1]],
                                [southeast[0], northwest[1]],
                                [northwest[0], northwest[1]],
                            ],
                        ],
                    },
                    startPosition: {
                        left: endPosition.x - endPosition.x / 2 + 'px',
                        top: endPosition.y - endPosition.y / 2 + 'px',
                    },
                    boundary: [
                        { lng: northwest[0], lat: northwest[1] }, //西北角
                        { lng: southeast[0], lat: northwest[1] }, // 东北角
                        { lng: northwest[0], lat: southeast[1] }, // 西南角
                        { lng: southeast[0], lat: southeast[1] }, //东南角
                    ],
                };
                resolve(this.drawData);

                // 相机移动至绘制矩形
                // this.viewer.scene.camera.flyTo({
                //     destination: Cesium.Rectangle.fromDegrees(
                //         northwest[0],
                //         southeast[1],
                //         southeast[0],
                //         northwest[1]
                //     ),
                //     duration: 0.7,
                //     complete: () => {
                //         //将绘制的的起始点和结束点经纬度转为屏幕坐标
                //         const startPosition = this.toScreenCoordinates(northwest, startHeight);
                //         const endPosition = this.toScreenCoordinates(southeast, endHeight);
                //         //获取绘制矩形宽高
                //         const width = Math.abs(endPosition.x - startPosition.x);
                //         const height = Math.abs(endPosition.y - startPosition.y);
                //         // 获取比例尺
                //         this.drawData = {
                //             id: new Date().getTime(),
                //             shape: DrawType.Polygon,
                //             sx: startPosition.x,
                //             sy: startPosition.y,
                //             width: width,
                //             height: height,
                //             clientW: document.body.clientWidth,
                //             clientH: document.body.clientHeight,
                //             geometry: {
                //                 type: 'Polygon',
                //                 coordinates: [
                //                     [
                //                         [northwest[0], northwest[1]],
                //                         [northwest[0], southeast[1]],
                //                         [southeast[0], southeast[1]],
                //                         [southeast[0], northwest[1]],
                //                         [northwest[0], northwest[1]]
                //                     ]
                //                 ]
                //             },
                //             startPosition: {
                //                 left: endPosition.x - endPosition.x / 2 + 'px',
                //                 top: endPosition.y - endPosition.y / 2 + 'px'
                //             },
                //             boundary: [
                //                 { lng: northwest[0], lat: northwest[1] }, //西北角
                //                 { lng: southeast[0], lat: northwest[1] }, // 东北角
                //                 { lng: northwest[0], lat: southeast[1] }, // 西南角
                //                 { lng: southeast[0], lat: southeast[1] } //东南角
                //             ]
                //         };
                //         resolve(this.drawData);
                //     }
                // });
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        });
    }

    drawCircle() {
        return new Promise((resolve, reject) => {
            // 圆半径
            let radius = 0;
            let cartesian;
            let cartesian2;
            // let endLngLat;
            let startHeight;

            // 左键事件
            this.handler.setInputAction((leftClick) => {
                if (!this.moveStatus) {
                    this.tooltip.showAt(
                        leftClick.position,
                        '<p>请拖动鼠标绘制区域范围</p>'
                    );

                    const { lngLat, cartographicHeight } =
                        screenCoordinatesToDegrees(
                            this.viewer,
                            leftClick.position
                        );

                    this.startLnglat = lngLat;
                    startHeight = cartographicHeight;

                    this.westSouthEastNorth = this.startLnglat;

                    if (this.startLnglat.length)
                        this.handler.removeInputAction(
                            Cesium.ScreenSpaceEventType.LEFT_CLICK
                        );

                    this.entity = this.viewer.entities.add({
                        position: new Cesium.CallbackProperty(() => {
                            return new Cesium.Cartesian3.fromDegrees(
                                ...this.startLnglat
                            );
                        }, false),
                        name: 'circle',
                        id: this.drawData.id,
                        ellipse: {
                            outline: true,
                            material: Cesium.Color.AQUA.withAlpha(0.5),
                            outlineColor: Cesium.Color.AQUA,
                            outlineWidth: 2,
                            clampToGround: true,
                        },
                    });
                    this.entity.ellipse.semiMajorAxis =
                        new Cesium.CallbackProperty(() => {
                            return radius;
                        }, false);
                    this.entity.ellipse.semiMinorAxis =
                        new Cesium.CallbackProperty(() => {
                            return radius;
                        }, false);

                    const ray = this.viewer.camera.getPickRay(
                        leftClick.position
                    );
                    cartesian = this.viewer.scene.globe.pick(
                        ray,
                        this.viewer.scene
                    );

                    // cartesian = this.viewer.camera.pickEllipsoid(
                    //     leftClick.position,
                    //     this.viewer.scene.globe.ellipsoid
                    // );

                    this.moveStatus = true;
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            //移动事件
            this.handler.setInputAction((move) => {
                if (!this.moveStatus) {
                    this.tooltip.showAt(
                        move.endPosition,
                        '<p>请单击鼠标左键开始绘制区域</p>'
                    );
                } else {
                    this.tooltip.showAt(
                        move.endPosition,
                        '<p>请单击鼠标右键结束绘制</p>'
                    );
                    // endLngLat = screenCoordinatesToDegrees(this.viewer, move.endPosition);
                    const ray = this.viewer.camera.getPickRay(move.endPosition);
                    const cartesian3 = this.viewer.scene.globe.pick(
                        ray,
                        this.viewer.scene
                    );
                    // cartesian2 = this.viewer.camera.pickEllipsoid(
                    //     move.endPosition,
                    //     this.viewer.scene.globe.ellipsoid
                    // );
                    radius = Cesium.Cartesian3.distance(cartesian, cartesian3);
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

            //右键事件
            this.handler.setInputAction((event) => {
                if (!this.moveStatus) return;
                this.tooltip.setVisible(false);
                this.handler.destroy();

                this.viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(
                        this.startLnglat[0],
                        this.startLnglat[1],
                        startHeight + radius * 5
                    ),
                    duration: 0.7,
                    complete: () => {
                        // 计算绘制圆的周长点位
                        const geometry = this.ellipseToJson(
                            this.entity.ellipse,
                            this.startLnglat
                        ).geometry;

                        // 取圆周上任意一点经纬度坐标
                        const coordinates = geometry.coordinates[0][10];
                        const circleSideLatLng = [
                            coordinates[0],
                            coordinates[1],
                        ];

                        // 屏幕中心点坐标转经纬度
                        const clientWidth = document.body.clientWidth;
                        const clientHeight = document.body.clientHeight;
                        const clientCenterW = clientWidth / 2;
                        const clientCenterH = clientHeight / 2;

                        const centerLatLng = screenCoordinatesToDegrees(
                            this.viewer,
                            {
                                x: clientCenterW,
                                y: clientCenterH,
                            }
                        );

                        // 求出指定方位经纬
                        const targetLatLng = getTargetLatLng(
                            centerLatLng.lngLat,
                            circleSideLatLng
                        );

                        // 指定经纬转换屏幕坐标
                        const northPosition = this.toScreenCoordinates(
                            targetLatLng,
                            startHeight
                        );

                        // 相对于屏幕圆的半径长度
                        const radius = clientCenterH - northPosition.y;

                        const { westNorth, eastSouth } = this.getCircleBoundary(
                            centerLatLng,
                            circleSideLatLng
                        );

                        this.drawData = {
                            id: new Date().getTime(),
                            shape: DrawType.Circle,
                            sx: clientCenterW - radius,
                            sy: northPosition.y,
                            width: radius * 2,
                            height: radius * 2,
                            clientW: clientWidth,
                            clientH: clientHeight,
                            geometry: geometry,
                            boundary: [
                                { lng: westNorth[0], lat: westNorth[1] }, //西北角
                                { lng: eastSouth[0], lat: westNorth[1] }, // 东北角
                                { lng: westNorth[0], lat: eastSouth[1] }, // 西南角
                                { lng: eastSouth[0], lat: eastSouth[1] }, //东南角
                            ],
                            startPosition: {
                                left: clientCenterW + 'px',
                                top: clientCenterH + 'px',
                            },
                        };

                        resolve(this.drawData);
                    },
                });
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        });
    }

    ellipseToJson(ellipses, center) {
        const { semiMajorAxis, semiMinorAxis } = ellipses;
        // turf要求km 将semiMajorAxis的值从米转为千米
        // 半长轴
        const semiMajor = semiMajorAxis.getValue() / 1000;
        // 半短轴
        const semiMinor = semiMinorAxis.getValue() / 1000;
        const [centerX, centerY] = center;
        return ellipse([centerX, centerY], semiMajor, semiMinor, {});
    }

    /**
     * @description 转换三维空间坐标到canvas坐标
     * @param latLng 经纬度
     * */
    toScreenCoordinates(latLng, height) {
        const position = Cesium.Cartesian3.fromDegrees(
            latLng[0],
            latLng[1],
            height
        );
        return Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            this.viewer.scene,
            position
        );
    }

    getCircleBoundary(centerLatLng, circleSideLatLng) {
        // 东方向经纬, lng作为东南角的lng
        const east = getTargetLatLng(centerLatLng.lngLat, circleSideLatLng, 90);
        // 南方向经纬, lat作为东南角的lat
        const south = getTargetLatLng(
            centerLatLng.lngLat,
            circleSideLatLng,
            180
        );
        // 获取西北角的经纬
        const westNorth = getTargetLatLng(
            centerLatLng.lngLat,
            [east[0], south[1]],
            -45
        );
        return { westNorth: westNorth, eastSouth: [east[0], south[1]] };
    }

    destroy(removeEntity = false) {
        if (removeEntity) {
            if (this.entity) this.viewer.entities.remove(this.entity);
        }
        this.tooltip?.destroy();
        this.handler?.destroy();
        this.handler = undefined;
    }
}
