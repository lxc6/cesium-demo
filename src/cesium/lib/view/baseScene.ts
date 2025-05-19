import { BehaviorSubject } from 'rxjs';
import {
    axiosHttpClient,
    BaseConfig,
    getBaseConfig,
    gisSelector,
    MainViewInfo,
    scene3dActions,
    scene3dSelector,
    store,
    Twins3D,
    Twins3DModel,
} from '@/data-access';
import { delay, Print } from '@/util';
import {
    ThreeDimensionalContextService,
    ViewMode,
} from './three-dimensional-context';
import { AppSettingsService } from '@/creator';
import proj4 from 'proj4';
import { getCameraPosition } from '../events/move';

export interface CameraDetail {
    lng: number;
    lat: number;
    height: number;
    pitch: number;
    heading: number;
    roll: number;
}
import { Injectable } from '@angular/core';

@Injectable()
export class BaseScene {
    loading$ = new BehaviorSubject(true);

    skipAnimation = true;

    sceneData?: MainViewInfo;

    // sceneData$ = new BehaviorSubject<any>([]);

    private reloadCount = 0;

    mapCompleted$ = new BehaviorSubject(false);

    baseConfig?: BaseConfig;

    pipelineOrDevice_scene = 'pipeline_scene'; // device_scene pipeline_scene

    constructor(protected setting: AppSettingsService) {}

    async setup(container: Element) {
        if (!container) {
            throw new Error(
                '模板中没有查询到容器, 请在模版中声明一个带有模板变量【#container】的dom元素用于初始化cesium'
            );
        }

        this.baseConfig = scene3dSelector().base;
        if (!this.baseConfig) {
            Print.Warn('基础配置缺失，正在重新获取');
            const result = await store.dispatch(getBaseConfig());
            if (result.payload && result.payload['data']) {
                this.baseConfig = scene3dSelector().base;
            } else {
                return;
            }
        }
        // let close; // 地球旋转动画
        ThreeDimensionalContextService.create(container)
            .then((Instance) => {
                this.loading$.next(false);
                // close = rotateAnimation(Instance.viewer);
                // 跳过地球
                this.flyToCenter();
                // 跳过地球
                return this.init();
            })
            .then(async () => {
                // 等待最少1500毫秒
                await Promise.all([delay(1500), this.initScene()]);
                console.log('加载完成');
                ThreeDimensionalContextService.isMapLoad = true;
                ThreeDimensionalContextService.mapCompleted$.next(true);
                this.mapCompleted$.next(true);

                // close();
                return this.flyToCenter();
            })
            .catch((e) => console.error(e))
            .finally(() => {
                const { scene } =
                    ThreeDimensionalContextService.Instance.viewer;
                scene.scanEffect.mode = Cesium.ScanEffectMode.CIRCLE;
                scene.scanEffect.show = true;
                scene.scanEffect.period = 5.0;
                scene.scanEffect.centerPostion =
                    ThreeDimensionalContextService.initialPerspective?.destination;
                setTimeout(() => {
                    scene.scanEffect.show = false;
                }, 5 * 1000);
                ThreeDimensionalContextService?.viewMode$?.next(ViewMode.IDLE);
                ThreeDimensionalContextService.Instance.cameraMove$.next(
                    getCameraPosition(
                        ThreeDimensionalContextService.Instance.viewer
                    )
                );
            });
    }

    setFlayLine() {
        // const aa = new FlightPreview();
        // aa.creatRouteStop();
    }

    // 组件初始化的方法
    init() {
        // noting to do
        // 如果组件需要初始化的时可重写此方法或者实现ngOnInit接口，内部调用super.ngOnInit()
    }

    /**
     * 获取场景信息并保存
     */
    async getScene() {
        const { data } = await axiosHttpClient.get<{
            data: Twins3DModel[Twins3D.MAIN_VIEW];
        }>(Twins3D.MAIN_VIEW, {
            modelId: this.setting.modelID,
        });
        if (!data) {
            return;
        }
        this.sceneData = data;
        store.dispatch(scene3dActions.setSceneInfos(data));
        return data;
    }

    /**
     * 初始化场景
     */
    async initScene() {
        const data = await this.getScene();
        if (!data) {
            console.error('获取场景信息失败');
            return;
        }

        // 出错时停止执行三秒，之后再次执行
        if (!ThreeDimensionalContextService.Instance || !this.baseConfig) {
            if (this.reloadCount >= 3) throw new Error('加载场景失败');
            this.reloadCount += 1;
            Print.Warn(`加载场景失败，正在重试第${this.reloadCount}次`);
            await delay(1000);
            return this.initScene();
        }

        const { viewer } = ThreeDimensionalContextService.Instance;

        console.log('datadata', data);
        // pipeline_scene device_scene
        const scpPromises: Promise<unknown>[] = [];
        ThreeDimensionalContextService.Instance?.viewer.scene.layers.removeAll(
            true
        );

        data.sceneList.forEach((sceneName) => {
            console.log('sceneName', sceneName);
            // if (sceneName.datasourceMark === 'yl_gis_test2_rvt_3d_device') return;
            const scene3dUrl = this.baseConfig!.service3dUrl;

            // 判断当前是显示地下管线还是地上模型，默认地下管线
            if (this.pipelineOrDevice_scene === 'pipeline_scene') {
                ThreeDimensionalContextService.Instance?.toggleAlpha(0);
            } else {
                ThreeDimensionalContextService.Instance?.toggleAlpha(1);
            }

            // const scene3dUrl =
            //     'http://192.168.1.100:8091/iserver/services/service_rvt_3d_aq_gis_test3/rest/realspace';
            if (this.pipelineOrDevice_scene === sceneName.sceneMark)
                scpPromises.push(
                    viewer.scene
                        .open(scene3dUrl, sceneName.sceneMark, {
                            autoSetView: false,
                        })
                        .then((layers) => {
                            // ThreeDimensionalContextService.sceneData$.next(layers);
                            ThreeDimensionalContextService.layersData = layers;

                            layers.forEach((layer) => {
                                // if (layer.name !== '专用设备_主物料流程@test') {
                                //     layer.visible = false;
                                // }

                                if (layer.isCreateSkirt !== undefined) {
                                    layer.isCreateSkirt = false;
                                }
                                layer.LoadingPriority =
                                    Cesium.LoadingPriorityMode.Child_Priority_NonLinear;
                            });
                            return layers;
                        })
                );
        });
        return Promise.all(scpPromises); // layers
    }

    async flyToCenter() {
        const { viewer } = ThreeDimensionalContextService.Instance;
        const basicInfo = this.sceneData?.basicInfo;

        if (!basicInfo) return;
        const info = JSON.parse(basicInfo.info.value) as CameraDetail;

        // viewer.scene.addLightSource(light);

        ThreeDimensionalContextService.initialPerspective = {
            destination: Cesium.Cartesian3.fromDegrees(
                info.lng,
                info.lat,
                info.height
            ),
            orientation: info,
            duration: 1.5,
        };

        // 开发环境跳过地球旋转
        return new Promise((resolve) => {
            // if (
            //     process.env['NX_TASK_TARGET_CONFIGURATION'] === 'production' ||
            //     !this.skipAnimation
            // ) {
            //     viewer.scene.camera.flyTo({
            //         duration: 2,
            //         destination: Cesium.Cartesian3.fromDegrees(
            //             Number(lng),
            //             Number(lat),
            //             basicInfo.height + 1000
            //         ),
            //         orientation: {
            //             heading: Cesium.Math.toRadians(0),
            //             pitch: Cesium.Math.toRadians(-90),
            //             roll: 0
            //         },
            //         complete: () => {
            //             viewer.scene.camera.flyTo({
            //                 complete: () => {
            //                     resolve(true);
            //                 },
            //                 ...ThreeDimensionalContextService.initialPerspective
            //             });
            //         }
            //     });
            // } else {
            viewer.scene.camera.setView({
                ...ThreeDimensionalContextService.initialPerspective,
            });
            resolve(true);
            // }
        });
    }

    convertCoordinates(position: [number, number]) {
        const { code } = gisSelector().getEpsgDef();
        return proj4(code, 'EPSG:4326', position);
    }

    destroy() {
        console.log('cesium destroy');
        this.loading$.complete();
        ThreeDimensionalContextService.viewMode$.next(ViewMode.IDLE);
        // ThreeDimensionalContextService.Instance?.viewer.scene.layers.removeAll(true);
        ThreeDimensionalContextService?.destroy();
    }
}
