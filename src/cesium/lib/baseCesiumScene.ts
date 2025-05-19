/**
 *  ---------------------------baseScene.ts-------------------------
 *  @Example        使用示例代码
 *  @Description
 * BaseCesiumScene类是用来封装基础的场景配置和操作。以下是一些BaseCesiumScene类的功能：
 * 场景初始化：在构造函数中进行场景的初始化，包括设置Viewer对象、设置场景参数等。
 * 事件处理：将场景中的各种事件（如鼠标点击、鼠标悬停、键盘输入等）进行封装，使其更易于使用。
 * 地形操作：对场景中的地形进行操作，如获取地形高度、绘制地形等。
 * 图层管理：对场景中的图层进行管理，如添加、删除、隐藏图层等。
 * 相机控制：对场景中的相机进行控制和操作，如缩放、旋转、平移相机等。
 * 实体管理：对场景中的实体进行管理，如添加、删除实体、更新实体属性等。
 * 工具方法：包括一些常用的工具方法，如坐标转换、距离计算、角度计算等。
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/4
 *  @Param
 *  @Return
 *  @File           libs/feature/core/src/lib/cesium
 *  @Update         [time:user] 某用户更新此文件
 * */
import { BehaviorSubject, filter, Subject } from 'rxjs';
import {
    convertLayerName,
    degreeToDirection,
    ObjectPool,
    TaskControl,
} from '@/util';
import { ClickEventObs, setupClickEvent } from './events/click';
import { setUpSettings } from './settingsConfig';
import { createLabelGraphics } from './components/label';
import {
    IconInstance,
    iconLabelController,
    PopupController,
} from './controller';
import { gisSelector } from '@/data-access';
import proj4 from 'proj4';
import { setupMoveEvent } from './events/move';

export class BaseCesiumScene {
    viewer!: typeof Cesium.Viewer;

    groundAlpha$ = new BehaviorSubject<number>(1);

    openModelDetail$ = new BehaviorSubject<any>('');

    cameraMove$: BehaviorSubject<any> = new BehaviorSubject({});

    moveSubject = new Subject<any>();

    pipelineScene$ = new BehaviorSubject<string>('pipeline_scene'); // 场景类型

    events!: {
        click$: Subject<ClickEventObs<{ [key: string]: string }>>;
    };

    cameraEvents!: {
        move$: Subject<any>;
    };

    settings = setUpSettings();

    taskManager = new TaskControl<[BaseCesiumScene]>([this], true);

    mouseStyle = {
        default: () => {
            this.viewer._element.style.cursor = '';
        },
        focus: () => {
            this.viewer._element.style.cursor = 'crosshair';
        },
        fire: () => {
            this.viewer._element.style.cursor =
                "url('/assets/fire-cursor.png') 22 52, auto";
        },
    };

    // entity对象池，默认存量为20
    labelPool = new ObjectPool<typeof Cesium.LabelGraphics>({
        createFn: () =>
            new Cesium.Entity({
                label: createLabelGraphics(),
            }),
        resetFn: (obj) => {
            obj.label.text = new Cesium.ConstantProperty('');
            this.viewer.entities.remove(obj);
            return obj;
        },
    });

    popupController: PopupController;

    private primitiveInstance?: IconInstance<unknown>;

    constructor(private container: Element) {
        const isDev =
            process.env['NX_TASK_TARGET_CONFIGURATION'] !== 'production';
        // 解决管点管线错位问题
        const obj = [6378137.0, 6378137.0, 6356752.3142451793];
        Cesium.Ellipsoid.WGS84 = Object.freeze(
            new Cesium.Ellipsoid(obj[0], obj[1], obj[2])
        );
        // 解决管点管线错位问题
        this.viewer = new Cesium.Viewer(container, {
            homeButton: false,
            animation: isDev, // 是否显示动画控件
            baseLayerPicker: false, // 是否显示图层选择控件
            geocoder: false, // 是否显示地名查找控件
            timeline: false, // 是否显示时间线控件
            sceneModePicker: false, // 是否显示投影方式控件
            navigationHelpButton: false, // 是否显示帮助信息控件
            // 是否显示点击要素之后显示的信息 设置为禁止 否则有报错
            infoBox: false,
            contextOptions: {
                // webgl2 msaa
                maxDrawingBufferWidth: 8640,
                maxDrawingBufferHeight: 2160,
                msaaLevel: 8,
                requestWebgl2: true,
                // requestWebgl2: true
            },
            // imageryProvider: new Cesium.SuperMapImageryProvider({
            //   url: 'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}'
            // })
        });

        this.popupController = new PopupController(this.viewer);

        if (isDev) {
            // this.viewer.extend(Cesium.viewerCesiumInspectorMixin);
            window['viewer'] = this.viewer;
            this.viewer.scene.debugShowFramesPerSecond = true; // 显示帧率,帧率与显示流畅度有关，或说与显卡有关
            // 将时间设置为当前并变更为中文
            // this.viewer.animation.viewModel.dateFormatter = dateTimeFormatter;
            // this.viewer.animation.viewModel.timeFormatter = (time, viewModel) =>
            //     dateTimeFormatter(time, viewModel, true);
            // this.viewer.timeline.makeLabel = dateTimeFormatter;
        }

        const credits = document.querySelector<HTMLDivElement>(
            '.cesium-widget-credits'
        );
        // 移除版权信息
        if (credits) {
            credits.remove();
        }
        const { scene } = this.viewer;
        scene.undergroundMode = true; // 设置开启地下场景
        scene.terrainProvider.isCreateSkirt = false; // 关闭裙边，去掉网格
        scene.useDepthPicking = true; // 启用使用深度缓冲区进行拾取
        // scene.pickTranslucentDepth = true;
        // 启用地形遮挡
        scene.globe.depthTestAgainstTerrain = true;
        // 设置鼠标进去地下
        scene.screenSpaceCameraController.enableCollisionDetection = true;
        scene.screenSpaceCameraController.minimumZoomDistance = 2; // 设置相机最小缩放距离,距离地表10米
        scene.screenSpaceCameraController.maximumZoomDistance = 1000; // 设置相机最大缩放距离,距离地表1000米
        scene.underGlobe.baseColor = Cesium.Color.fromCssColorString('#0f2042');
        scene.skyBox.show = false; // 是否显示星空
        // scene.sun.show = false; // 是否显示太阳 关闭后将没有平行光，需要自行创建
        // scene.moon.show = false; // 是否显示有月亮
        // scene.skyAtmosphere.show = false; // 是否隐藏大气圈
        // 是否支持图像渲染像素化处理
        if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
            this.viewer.resolutionScale = window.devicePixelRatio;
        }
        // 开启抗锯齿
        scene.fxaa = true;
        scene.postProcessStages.fxaa.enabled = true;

        // const collection = this.viewer.scene.postProcessStages;
        // const silhouette = collection.add(Cesium.PostProcessStageLibrary.createBrightnessStage());
        // silhouette.enabled = true;
        // silhouette.uniforms.brightness = 0.5; //（调节亮度0-3最佳）
        // this.viewer.scene.globe.enableLighting = true; // true：360度地球有亮和暗区分，亮和黑的影像地图亮度是一样的
        this.viewer.shadows = false; // 是否显示阴影
        this.setClock();
        this.setupEvents();
        this.getCameraMove();

        this.getStatus();
    }

    // 设置cesium的时间永远为白天的上午11点到下午两点间循环
    setClock() {
        const clock = this.viewer.clock;
        // ------------调整时间防止时间光照影像模型变暗
        // 设置当前时间为北京时间的上午11点
        // const startTime = Cesium.JulianDate.fromIso8601('2023-09-01T03:00:00Z'); // 对应北京时间11:00:00
        //
        // // 设置结束时间为北京时间的下午2点
        // const endTime = Cesium.JulianDate.fromIso8601('2023-09-01T06:00:00Z'); // 对应北京时间14:00:00

        const startTime = Cesium.JulianDate.fromIso8601(
            '2023-09-01T00:00:00+08:00'
        );
        const endTime = Cesium.JulianDate.addHours(
            startTime,
            24,
            new Cesium.JulianDate()
        );

        // 将当前时间设置为起始时间
        clock.currentTime = Cesium.JulianDate.fromIso8601(
            '2023-09-01T03:00:00Z'
        );

        // 设置时钟的开始和结束时间
        clock.startTime = startTime;
        clock.stopTime = endTime;

        // 设置时钟的循环模式为循环
        clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 循环停止模式

        // 将当前时间设置为时钟的当前时间
        // clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK;

        // 将时钟的时钟速率设置为默认值（1.0）
        clock.multiplier = 1;
        // ------------调整时间防止时间光照影像模型变暗

        this.viewer.shadows = true;
        this.viewer.scene.globe.enableLighting = true;

        // clock.onTick.addEventListener(() => {
        //     const sunPosition =
        //         Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(
        //             clock.currentTime
        //         );
        // });
    }

    updateCurrentTime(currentTime) {
        this.viewer.clock.currentTime = currentTime;
    }

    setupEvents() {
        this.events = {
            click$: setupClickEvent(this.viewer, this.settings.clickEvent),
        };
        // this.events.click$ = setupClickEvent(this.viewer, this.settings.clickEvent);
        const clickEvent = this.settings.clickEvent;
        // 添加用于tile的属性点击事件
        clickEvent.attachEventHandler('tile click', (primitive, position) => {
            if (
                !primitive ||
                !(
                    primitive._dataType === 'BIM' ||
                    primitive._dataType === 'ArtificialModel'
                ) ||
                !this.settings.clickEvent.attrBox
            )
                return false;

            const aaaaa = this.viewer.scene.pickPosition(position);
            const car33 = new Cesium.Cartesian3(aaaaa.x, aaaaa.y, aaaaa.z);
            const cartographic = Cesium.Cartographic.fromCartesian(car33);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const lng = Cesium.Math.toDegrees(cartographic.longitude);
            const alt = cartographic.height;

            // if (!(primitive.name as string).includes('pipeline')) {
            if (
                !(convertLayerName(primitive.name) as string).includes(
                    'pipeline'
                )
            ) {
                const id = primitive.id + primitive.getSelection().toString();
                this.openModelDetail$.next(primitive);
                clickEvent.lastClickID = id;
                return true;
            } else {
                const id = primitive.id + primitive.getSelection().toString();
                const _position = this.viewer.scene.pickPosition(position);
                primitive.selfPosition = _position;
                this.openModelDetail$.next(primitive);
                // this.createPipePopup(primitive, _position);
                return true;
                // const id = primitive.id + primitive.getSelection().toString();
                // this.openModelDetail$.next(primitive);
                // console.log(id);
                // const popupRef = this.popupController.getOrCreatePopup('BIM_ATTR', {
                //     type: 'BIM'
                // });
                // const _position = this.viewer.scene.pickPosition(position);
                // if (clickEvent.lastClickID === id) {
                //     popupRef.setPosition(_position);
                //     return true;
                // }
                //
                // if (clickEvent.component) {
                //     popupRef.create({ element: clickEvent.component(primitive) });
                //     popupRef.setPosition(_position);
                // } else {
                //     clickEvent.html(primitive).then(htmlStr => {
                //         console.log(htmlStr, 'htmlStr');
                //         popupRef.create({ html: htmlStr });
                //         popupRef.setPosition(_position);
                //     });
                // }
                // clickEvent.lastClickID = id;
                // return true;
            }
        });

        // 如果没有点击到任何对象 则关闭弹窗
        this.settings.clickEvent.attachEventHandler('clear', (primitive) => {
            if (primitive) {
                return false;
            }
            clickEvent.lastClickID = undefined;
            // this.popupController.closeAll();
            return true;
        });

        // 属性弹窗
        this.events.click$
            // 如果设置不显示属性框时  以下逻辑不触发
            .pipe(filter(() => this.settings.clickEvent.attrBox))
            .subscribe(({ primitive, position }) => {
                const handlers = this.settings.clickEvent.handler.values();
                // 循环点击事件的处理器，如果有一个命中则中断
                for (const handler of handlers) {
                    if (handler(primitive, position)) break;
                }
            });
    }

    createPipePopup(primitive, position) {
        const popupRef = this.popupController.getOrCreatePopup('BIM_ATTR', {
            type: 'BIM',
        });
        const id = primitive.id + primitive.getSelection().toString();
        if (this.settings.clickEvent.component) {
            popupRef.create({
                element: this.settings.clickEvent.component(primitive),
            });
            popupRef.setPosition(position);
        } else {
            this.settings.clickEvent.html(primitive).then((htmlStr) => {
                popupRef.create({ html: htmlStr });
                popupRef.setPosition(position);
            });
        }
        this.settings.clickEvent.lastClickID = id;
    }

    getStatus() {
        this.viewer.screenSpaceEventHandler.setInputAction((evt) => {
            const { ellipsoid } = this.viewer.scene.globe;
            const cartesian = this.viewer.camera.pickEllipsoid(
                evt.endPosition,
                ellipsoid
            );
            if (cartesian) {
                const cartographic =
                    ellipsoid.cartesianToCartographic(cartesian);
                const dir = Cesium.Math.toDegrees(
                    this.viewer.scene.camera.heading
                );
                const height = this.viewer.scene.globe.getHeight(cartographic);
                const coordinatesArr = this.convertCoordinates([
                    Cesium.Math.toDegrees(cartographic.longitude),
                    Cesium.Math.toDegrees(cartographic.latitude),
                ]);
                this.moveSubject.next({
                    X: coordinatesArr[0]?.toFixed(2),
                    Y: coordinatesArr[1]?.toFixed(2),

                    方向: `${degreeToDirection(dir)} ${dir.toFixed(2)}°`,
                    俯仰角: (-Cesium.Math.toDegrees(
                        this.viewer.scene.camera.pitch
                    ))?.toFixed(2),

                    视高: `${Number(
                        this.viewer.camera.positionCartographic.height
                    )?.toFixed(2)}`,
                    海拔: height ? `${height.toFixed(2)}` : 0,
                });
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    convertCoordinates(position: [number, number]) {
        const { def } = gisSelector().getEpsgDef();
        return proj4('EPSG:4326', def, position);
    }

    toggleAlpha(alpha = 0) {
        // this.viewer.scene.pickTranslucentDepth = alpha !== 1;

        const backup = this.viewer.scene.globe.globeAlpha;
        this.viewer.scene.globe.globeAlpha = alpha;
        for (let i = 0, len = this.viewer.imageryLayers.length; i < len; i++) {
            this.viewer.imageryLayers.get(i).alpha = alpha;
        }

        // 模型透明度设置
        // ThreeDimensionalContextService.layersData.forEach(layer => {
        //     layer.style3D.fillForeColor = new Cesium.Color(1.0, 1.0, 1.0, alpha);
        // });

        this.groundAlpha$.next(alpha);
        return () => {
            this.toggleAlpha(backup);
        };
    }

    // 设置模型的透明度
    setModelAlpha(alpha = 0) {
        // 模型透明度设置
        const allLayers = this.viewer.scene.layers.layerQueue;
        allLayers.forEach((layer) => {
            // console.log(layer, '2323');
            layer.style3D.fillForeColor = new Cesium.Color(
                1.0,
                1.0,
                1.0,
                alpha
            );
        });
    }

    /* 获取camera中心点坐标 */
    getCenterPosition() {
        const result = this.viewer.camera.pickEllipsoid(
            new Cesium.Cartesian2(
                this.viewer.canvas.clientWidth / 2,
                this.viewer.canvas.clientHeight / 2
            )
        );
        if (!result) return;
        const curPosition =
            Cesium.Ellipsoid.WGS84.cartesianToCartographic(result);
        const lon = (curPosition.longitude * 180) / Math.PI;
        const lat = (curPosition.latitude * 180) / Math.PI;
        const { height } = this.viewer.camera.positionCartographic;
        return {
            lon,
            lat,
            height,
        };
    }

    /**
     * 监听摄像机移动事件
     * */
    getCameraMove() {
        this.cameraEvents = {
            move$: setupMoveEvent(this.viewer),
        };
        this.cameraEvents.move$.subscribe((res) => {
            this.cameraMove$.next(res);
        });
    }

    // 以倾斜的方式飞往点位
    flyToPosition(
        position: typeof Cesium.Cartesian3,
        height = 200.0,
        duration = 1
    ) {
        const heading = Cesium.Math.toRadians(0.0);
        const pitch = Cesium.Math.toRadians(-60.0);
        this.viewer.camera.flyToBoundingSphere(
            new Cesium.BoundingSphere(position, 5000),
            {
                offset: new Cesium.HeadingPitchRange(heading, pitch, height),
                duration,
            }
        );
    }

    /**
     * 定位管线设施
     * @param once  是否清楚上次定位
     * @param type  用于分组
     */
    locationOfPoint(once = true, type = 'point_location') {
        return {
            // 返回默认的分组名
            type,
            /**
             * 定位并飞往坐标点
             * @param id  用于按ID删除
             * @param name  用于查找图标
             * @param coordinates   三维坐标
             * @param attribute 图标的属性 如果传入点击图标时会打开设备详情弹窗，请注意传入其所需要的数据
             */
            fly: async (
                id: string,
                name: string,
                coordinates: string,
                attribute?: unknown
            ) => {
                if (once) {
                    this.primitiveInstance?.destroy();
                }
                const [x, y, z] = coordinates.split(',').map(Number);
                const primitiveInstance =
                    await iconLabelController.createIconLabel(id, {
                        name,
                        type,
                        lon: x,
                        lat: y,
                        height: z,
                        attribute: attribute,
                    });
                this.primitiveInstance = primitiveInstance;
                this.flyToPosition(Cesium.Cartesian3.fromDegrees(x, y, z));
                return primitiveInstance;
            },
            // 移除当前点位
            remove: () => this.primitiveInstance?.destroy(),
        };
    }

    // 清理回收cesium内存
    destroy() {
        this.groundAlpha$.complete();
        this.openModelDetail$.complete();
        this.pipelineScene$.complete();
        this.cameraMove$.complete();
        this.taskManager.destroy();
        this.labelPool.clear();
        Object.keys(this.events).forEach((key) => {
            this.events[key].complete();
            delete this.events[key];
        });
        this.viewer = undefined as any;
    }
}
