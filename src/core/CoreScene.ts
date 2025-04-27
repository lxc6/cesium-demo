import { CameraManager } from '../tools/CameraManager';
import { EntityManager } from '../tools/EntityManager';
import { LayerManager } from '../tools/LayerManager';
import { EventSystem } from '../tools/EventSystem';
import { TerrainService } from '../tools/TerrainService';
import { AnalysisManager } from '../tools/AnalysisManager';
// import { MeasureManager } from '../tools/MeasureManager';
// import { DrawManager } from '../tools/DrawManager';
import { SceneOptions, ViewerOptions } from '../types';
import { bingMap } from '../utils/providers';
import { useCesiumStore } from '@/store/cesium';
import { getRainShader, getSnowShader, getBloomShader } from '../shaders';

/**
 * Cesium 场景基础类
 * 用于管理和控制 Cesium 场景的核心功能
 */
export class CoreScene {
    public viewer: Cesium.Viewer = {} as Cesium.Viewer;
    public cameraManager: CameraManager = {} as CameraManager;
    public entityManager: EntityManager = {} as EntityManager;
    public layerManager: LayerManager = {} as LayerManager;
    public eventSystem: EventSystem = {} as EventSystem;
    public terrainService: TerrainService = {} as TerrainService;
    public analysisManager: AnalysisManager = {} as AnalysisManager;
    // public measureManager: MeasureManager = {} as MeasureManager;
    // public drawManager: DrawManager = {} as DrawManager;

    private eventListeners: Map<string, Function[]> = new Map();
    private isDestroyed = false;
    private frameCallbacks: Set<() => void> = new Set();
    private renderLoopHandle: number | null = null;

    /**
     * 构造函数
     * @param container 容器元素或ID
     * @param options 场景配置选项
     */
    constructor(container: string | HTMLElement, options?: SceneOptions) {
        // 初始化时更新 store
        const { setCoreCesium, setIsReady } = useCesiumStore.getState();

        try {
            this.initViewer(container, options);
            this.initManagers();
            this.setupBasicConfigs();
            this.setupPerformanceConfigs();
            this.setupTimeConfig();
            this.startRenderLoop();
            this.setupResizeHandler();

            // 初始化完成后更新状态
            setCoreCesium(this);
            setIsReady(true);
        } catch (error) {
            console.error('初始化场景失败:', error);
            setCoreCesium(null);
            setIsReady(false);
        }
    }

    /**
     * 初始化 Cesium Viewer
     * @private
     */
    private initViewer(
        container: string | HTMLElement,
        options?: ViewerOptions
    ) {
        const defaultOptions = {
            homeButton: false,
            // fullscreenButton: false,
            animation: false, // 是否显示动画控件
            baseLayerPicker: false, // 是否显示图层选择控件
            geocoder: false, // 是否显示地名查找控件
            timeline: false, // 是否显示时间线控件
            sceneModePicker: false, // 是否显示投影方式控件
            // navigation: false, // 是否显示导航控件
            navigationHelpButton: false, // 是否显示帮助信息控件
            infoBox: false, // 是否显示点击要素之后显示的信息 设置为禁止 否则有报错
            terrainProvider: new Cesium.EllipsoidTerrainProvider(), //地形
            // 浏览器支持，则使用 WebGL渲染上下文
            contextOptions: {
                webgl: {
                    alpha: true,
                    depth: true,
                    stencil: true,
                    antialias: true,
                    premultipliedAlpha: true,
                    preserveDrawingBuffer: true,
                    failIfMajorPerformanceCaveat: false,
                },
            },

            // sceneMode: Cesium.SceneMode.COLUMBUS_VIEW, // 指定场景显示模式 地形
            // terrain: Cesium.Terrain.fromWorldTerrain(), // 使用 Cesium 全球地形数据来渲染地球的地形
        };

        this.viewer = new Cesium.Viewer(container, {
            ...defaultOptions,
            ...options,
            imageryProvider: bingMap(),
        });
        console.log('this.viewer------------', this.viewer);
    }

    /**
     * 初始化各个管理器
     * @private
     */
    private initManagers() {
        this.cameraManager = new CameraManager(this.viewer);
        this.entityManager = new EntityManager(this.viewer);
        this.layerManager = new LayerManager(this.viewer);
        this.eventSystem = new EventSystem(this.viewer);
        this.terrainService = new TerrainService(this.viewer);
        this.analysisManager = new AnalysisManager(this.viewer);
        // this.measureManager = new MeasureManager(this.viewer);
        // this.drawManager = new DrawManager(this.viewer);
    }

    /**
     * 设置基础场景配置
     * @private
     */
    private setupBasicConfigs() {
        const { scene } = this.viewer;

        scene.debugShowFramesPerSecond = true; // 显示帧率,帧率与显示流畅度有关，或说与显卡有关
        // 基础场景配置
        scene.globe.enableLighting = true; //启用场景光源照亮地球
        scene.globe.depthTestAgainstTerrain = true; // 启用地形遮挡
        scene.globe.showSkirts = false; // 关闭裙边，去掉网格
        scene.globe.baseColor = Cesium.Color.WHITE;

        // 大气和天空盒配置
        if (scene.skyAtmosphere) {
            scene.skyAtmosphere.show = true;
        }
        scene.fog.enabled = true;
        scene.fog.density = 0.0001;
        scene.fog.screenSpaceErrorFactor = 2.0;

        scene.useDepthPicking = true; // 启用使用深度缓冲区进行拾取
        scene.backgroundColor = new Cesium.Color(0, 0, 0, 0);

        // scene.undergroundMode = true; // 设置开启地下场景
        scene.screenSpaceCameraController.enableCollisionDetection = true; // 设置鼠标进去地下 根据鼠标输入修改相机的位置和方向，应用于画布
        scene.screenSpaceCameraController.minimumZoomDistance = -100; // 设置相机最小缩放距离,距离地表-1000米

        // 移除默认的版权信息
        this.removeDefaultCredits();

        // viewer配置
        this.viewer.resolutionScale = window.devicePixelRatio; //是否支持图像渲染像素化处理
        this.viewer.shadows = false; // 是否显示阴影
    }

    /**
     * 设置性能相关配置
     * @private
     */
    private setupPerformanceConfigs() {
        const { scene } = this.viewer;

        // 性能优化配置
        scene.fog.enabled = true;
        scene.fog.density = 0.0001;
        scene.postProcessStages.fxaa.enabled = true;
        scene.globe.maximumScreenSpaceError = 2;
        scene.globe.tileCacheSize = 1000;

        // 设置分辨率缩放
        this.viewer.resolutionScale = window.devicePixelRatio;
    }

    /**
     * 设置时间配置
     * @private
     */
    private setupTimeConfig(): void {
        // 设置时间循环
        const startTime = Cesium.JulianDate.fromDate(
            new Date(2024, 0, 1, 11, 0, 0) // 上午11点
        );
        const endTime = Cesium.JulianDate.fromDate(
            new Date(2024, 0, 1, 14, 0, 0) // 下午2点
        );

        // 设置时钟起止时间
        this.viewer.clock.startTime = startTime;
        this.viewer.clock.stopTime = endTime;
        this.viewer.clock.currentTime = startTime;
        this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 循环模式
        // this.viewer.clock.multiplier = 1200; // 时间流逝速度
        this.viewer.clock.multiplier = 1; // 时间流逝速度
        this.viewer.clock.shouldAnimate = true; // 开启时间动画

        // 设置场景照明
        this.viewer.scene.globe.enableLighting = true;
        this.viewer.shadows = true;

        // 添加太阳光照效果
        // this.viewer.scene.sun = new Cesium.Sun();
    }

    /**
     * 移除默认的版权信息
     * @private
     */
    private removeDefaultCredits() {
        const credits = this.viewer.cesiumWidget.creditContainer as HTMLElement;
        if (credits) {
            credits.style.display = 'none';
        }
    }

    /**
     * 添加事件监听器
     * @param event 事件名称
     * @param callback 回调函数
     */
    public on(event: string, callback: Function) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)?.push(callback);
    }

    /**
     * 移除事件监听器
     * @param event 事件名称
     * @param callback 回调函数
     */
    public off(event: string, callback: Function) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     * @param event 事件名称
     * @param data 事件数据
     */
    public emit(event: string, data?: any) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach((callback) => callback(data));
        }
    }

    /**
     * 设置场景时间
     * @param date 日期对象
     */
    public setTime(date: Date): void {
        this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(date);
    }

    /**
     * 启用/禁用阴影
     * @param enabled 是否启用
     */
    public setShadows(enabled: boolean): void {
        this.viewer.shadows = enabled;
        this.viewer.terrainShadows = enabled
            ? Cesium.ShadowMode.ENABLED
            : Cesium.ShadowMode.DISABLED;
    }

    /**
     * 设置场景质量
     * @param quality 质量级别 (0-1)
     */
    public setQuality(quality: number): void {
        const { scene } = this.viewer;
        scene.globe.maximumScreenSpaceError = 16 - quality * 8;
        scene.fog.density = 0.0001 + (1 - quality) * 0.0009;
        this.viewer.resolutionScale = 0.5 + quality * 0.5;
    }

    /**
     * 检查场景是否已销毁
     */
    public get isSceneDestroyed(): boolean {
        return this.isDestroyed;
    }

    /**
     * 初始化渲染循环
     */
    private startRenderLoop(): void {
        const animate = () => {
            if (!this.isDestroyed) {
                this.frameCallbacks.forEach((callback) => callback());
                this.renderLoopHandle = requestAnimationFrame(animate);
            }
        };
        this.renderLoopHandle = requestAnimationFrame(animate);
    }

    /**
     * 添加每帧回调
     */
    public addFrameCallback(callback: () => void): void {
        this.frameCallbacks.add(callback);
    }

    /**
     * 移除每帧回调
     */
    public removeFrameCallback(callback: () => void): void {
        this.frameCallbacks.delete(callback);
    }

    /**
     * 设置窗口大小变化处理
     */
    private setupResizeHandler(): void {
        const resizeHandler = () => {
            this.viewer.resize();
            this.viewer.scene.requestRender();
        };
        window.addEventListener('resize', resizeHandler);
    }

    /**
     * 设置场景性能监控
     */
    public enablePerformanceMonitoring(callback?: (stats: any) => void): void {
        const scene = this.viewer.scene;
        scene.debugShowFramesPerSecond = true;

        if (callback) {
            this.addFrameCallback(() => {
                const stats = {
                    fps: Math.round(1000 / (scene as any).lastRenderTime) || 0,
                    primitives: scene.primitives.length,
                    memory: (performance as any).memory?.usedJSHeapSize || 0,
                };
                callback(stats);
            });
        }
    }

    /**
     * 设置场景环境效果
     */
    public setEnvironmentEffects(options: {
        fog?: boolean;
        fogDensity?: number;
        bloom?: boolean;
        bloomIntensity?: number;
    }): void {
        const { scene } = this.viewer;

        // 雾效果
        if (options.fog !== undefined) {
            scene.fog.enabled = options.fog;
            if (options.fogDensity !== undefined) {
                scene.fog.density = options.fogDensity;
            }
        }

        // 泛光效果
        if (options.bloom !== undefined) {
            const bloom = new Cesium.PostProcessStage({
                name: 'bloom',
                fragmentShader: getBloomShader(),
                uniforms: {
                    glowOnly: false,
                    intensity: options.bloomIntensity || 1.0,
                },
            });
            scene.postProcessStages.add(bloom);
        }
    }

    /**
     * 设置场景天气效果
     */
    public setWeatherEffect(
        type: 'rain' | 'snow' | 'none',
        intensity = 1.0
    ): void {
        // 移除现有效果
        this.viewer.scene.postProcessStages.removeAll();

        if (type === 'none') return;

        // 确保强度值在有效范围内
        const clampedIntensity = Math.max(0.0, Math.min(1.0, intensity));

        const shader = type === 'rain' ? getRainShader() : getSnowShader();
        const weatherStage = new Cesium.PostProcessStage({
            fragmentShader: shader,
            uniforms: {
                intensity: clampedIntensity,
            },
        });

        this.viewer.scene.postProcessStages.add(weatherStage);

        // 输出当前天气效果状态
        console.log(
            `天气效果已更新 - 类型: ${type}, 强度: ${clampedIntensity}`
        );
    }

    /**
     * 销毁场景，释放资源
     */
    public destroy(): void {
        if (this.isDestroyed) return;

        const { setCoreCesium, setIsReady } = useCesiumStore.getState();

        // 清理资源
        if (this.renderLoopHandle !== null) {
            cancelAnimationFrame(this.renderLoopHandle);
        }

        this.eventListeners.clear();
        this.frameCallbacks.clear();
        this.entityManager.destroy();
        this.layerManager.destroy();
        this.eventSystem.destroy();
        this.terrainService.destroy();

        if (this.viewer && !this.viewer.isDestroyed()) {
            this.viewer.destroy();
        }

        this.isDestroyed = true;

        // 更新状态
        setCoreCesium(null);
        setIsReady(false);
    }
}
