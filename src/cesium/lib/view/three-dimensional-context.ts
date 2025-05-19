import { BaseCesiumScene, createBaseCesiumView, localMap } from '@/cesium';
import {
    AsyncSubject,
    BehaviorSubject,
    filter,
    Subject,
    throttleTime,
} from 'rxjs';
import { signal } from '@angular/core';

export enum ViewMode {
    LOADING,
    IDLE,
    WORKING,
}

export class ThreeDimensionalContext {
    Instance!: BaseCesiumScene;

    // BehaviorSubject: 需要一个初始值并会在订阅时发送其当前值
    // 当前视图模式。working工作模式，例如分析， loading加载中， idle空闲
    viewMode$ = new BehaviorSubject<ViewMode>(ViewMode.LOADING);

    // AsyncSubject: 在完成时发送一个值，完成后它将向所有 Observer 发送其最新值
    completed$ = new AsyncSubject<boolean>();

    //模型透明度
    // sceneData$ = new BehaviorSubject<any>([]);

    layersData: any[] = [];

    onKey$ = new Subject<KeyboardEvent['code']>();

    // 是否允许点击模型
    isClickModel = true;

    // 测量类型
    measureType = '';

    // 地图加载完成
    isMapLoad = false;

    mapCompleted$ = new BehaviorSubject<boolean>(false);

    initialPerspective?: {
        duration: number;
        orientation: { heading: number; roll: number; pitch: number };
        destination: typeof Cesium.Cartesian3;
    };

    miniMap = signal(false);

    constructor() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this), {
            passive: true,
        });
        this.onKey$
            .pipe(
                filter((code) => code === 'Escape'),
                throttleTime(500)
            )
            .subscribe(() => {
                this.Instance.taskManager.stop();
                this.isClickModel = true;
                this.viewMode$.next(ViewMode.IDLE);
            });
    }

    useModeInView() {
        return this.viewMode$.asObservable().pipe(throttleTime(500));
    }

    // 返回模型图层
    // useSceneData() {
    //     return this.sceneData$.asObservable();
    // }

    // 获取地图加载完成
    getMapCompleted$() {
        return this.mapCompleted$.asObservable();
    }

    handleKeyDown(ev: KeyboardEvent) {
        this.onKey$.next(ev.code);
    }

    async create(container: Element): Promise<BaseCesiumScene> {
        if (this.Instance) return this.Instance;
        this.Instance = await createBaseCesiumView(
            container,
            process.env['NX_CESIUM_ASSETS']
        );
        const helper = new Cesium.EventHelper();
        return new Promise((resolve, reject) => {
            if (this.Instance) {
                helper.add(
                    this.Instance.viewer.scene.globe.tileLoadProgressEvent,
                    (event) => {
                        // console.log('每次加载矢量切片都会进入这个回调');
                        if (event === 0) {
                            helper.removeAll(undefined);
                            // this.Instance.viewer.imageryLayers.addImageryProvider(bingMap());
                            // this.Instance.viewer.terrainProvider = localThreeMap();
                            this.Instance.viewer.imageryLayers.addImageryProvider(
                                localMap()
                            );
                            this.completed$.next(true);
                            this.completed$.complete();
                        }
                    }
                );

                resolve(this.Instance);
            } else {
                reject();
            }
        });
    }

    destroy() {
        this.onKey$.complete();
        this.Instance?.destroy();
        this.Instance = undefined as any;
        this.viewMode$.complete();
        this.mapCompleted$.complete();
    }
}

export const ThreeDimensionalContextService = new ThreeDimensionalContext();
