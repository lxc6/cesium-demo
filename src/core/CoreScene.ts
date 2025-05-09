import { CameraManager } from '../tools/CameraManager';
import { EntityManager } from '../tools/EntityManager';
import { LayerManager } from '../tools/LayerManager';
import { EventSystem } from '../tools/EventSystem';
import { TerrainService } from '../tools/TerrainService';
import { AnalysisManager } from '../tools/AnalysisManager';
// import { MeasureManager } from '../tools/MeasureManager';
// import { DrawManager } from '../tools/DrawManager';
import { SceneOptions, ViewerOptions } from '../types';
import { bingMap, localMap } from '../utils/providers';
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
            // console.log('isReady', isReady);
            console.log('------------this--------', this);

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
            // imageryProvider: bingMap(), // 底图服务
        });

        // this.viewer.imageryLayers.addImageryProvider(localMap());
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

        // 场景基础配置
        scene.debugShowFramesPerSecond = true; // 显示帧率
        scene.useDepthPicking = true; // 启用深度缓冲区拾取
        scene.backgroundColor = new Cesium.Color(0, 0, 0, 0);

        // 地球配置
        scene.globe.enableLighting = true; // 启用场景光照
        scene.globe.depthTestAgainstTerrain = true; // 启用地形遮挡
        scene.globe.baseColor = Cesium.Color.WHITE;
        scene.globe.showSkirts = false; // 关闭裙边
        scene.globe.tileCacheSize = 1000; // 设置缓存大小
        scene.globe.maximumScreenSpaceError = 2; // 更精细的地形渲染
        scene.globe.preloadSiblings = false; // 禁用兄弟瓦片预加载

        // 大气和天空盒
        if (scene.skyAtmosphere) {
            scene.skyAtmosphere.show = true;
            scene.skyAtmosphere.brightnessShift = 0.2; // 亮度调整
            scene.skyAtmosphere.hueShift = 0.0; // 色调调整
            scene.skyAtmosphere.saturationShift = 0.1; // 饱和度调整
        }

        // 雾效果
        scene.fog.enabled = true;
        scene.fog.density = 0.0001;
        scene.fog.screenSpaceErrorFactor = 2.0;
        scene.fog.minimumBrightness = 0.1;

        // 相机控制
        scene.screenSpaceCameraController.enableCollisionDetection = true;
        scene.screenSpaceCameraController.minimumZoomDistance = -10;
        scene.screenSpaceCameraController.maximumZoomDistance = 10000;
        scene.screenSpaceCameraController.enableTilt = true;

        // 移除默认版权信息
        this.removeDefaultCredits();

        // 视图配置
        this.viewer.resolutionScale = window.devicePixelRatio;
        this.viewer.shadows = false;
        this.viewer.scene.globe.enableLighting = true;
    }

    /**
     * 设置性能相关配置
     * @private
     */
    private setupPerformanceConfigs() {
        const { scene } = this.viewer;

        // 性能优化配置
        scene.fxaa = true; // 开启抗锯齿
        scene.postProcessStages.fxaa.enabled = true; // 启用FXAA抗锯齿
        // scene.undergroundMode = true; // 设置开启地下场景
        // scene.terrainProvider.isCreateSkirt = false; // 关闭裙边，去掉网格

        scene.logarithmicDepthBuffer = false; // 禁用对数深度缓冲
        scene.requestRenderMode = true; // 按需渲染
        scene.maximumRenderTimeChange = 0.0; // 渲染时间变化阈值

        // 内存优化
        // scene.globe.tileLoadProgressEvent = true; // 启用瓦片加载进度事件
        scene.globe.terrainExaggeration = 1.0; // 地形夸张系数
    }

    /**
     * 设置时间配置
     * @private
     */
    private setupTimeConfig(): void {
        const { clock, scene } = this.viewer;

        // 设置默认时间范围
        const startTime = Cesium.JulianDate.fromDate(
            new Date(2024, 0, 1, 11, 0, 0) // 上午11点
        );
        const endTime = Cesium.JulianDate.fromDate(
            new Date(2024, 0, 1, 14, 0, 0) // 下午2点
        );

        // 时钟配置
        clock.startTime = startTime;
        clock.stopTime = endTime;
        clock.currentTime = startTime;
        clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 循环模式
        clock.multiplier = 1.0; // 时间流逝速度
        clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟步进模式
        clock.shouldAnimate = true; // 开启时间动画

        // 场景照明配置
        scene.globe.enableLighting = true; // 启用全球照明
        scene.globe.dynamicAtmosphereLighting = true; // 启用动态大气照明
        scene.globe.dynamicAtmosphereLightingFromSun = true; // 从太阳获取照明

        // 阴影配置
        this.viewer.shadows = true;
        scene.shadowMap.enabled = true;
        scene.shadowMap.softShadows = true; // 启用柔和阴影
        scene.shadowMap.size = 2048; // 阴影贴图大小

        // 添加太阳和月亮
        scene.sun = new Cesium.Sun();
        scene.moon = new Cesium.Moon();

        // // 设置默认光照
        // scene.light = new Cesium.DirectionalLight({
        //     direction: scene.sun.position,
        //     intensity: 2.0,
        //     color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
        // });
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
    public setWeatherEffect(type: 'rain' | 'snow' | 'none', speed = 1.0): void {
        // 移除现有效果
        this.viewer.scene.postProcessStages.removeAll();

        if (type === 'none') return;

        // 确保参数值在有效范围内
        const clampedSpeed = Math.max(0.1, Math.min(5.0, speed));

        const shader = type === 'rain' ? getRainShader() : getSnowShader();
        const weatherStage = new Cesium.PostProcessStage({
            fragmentShader: shader,
            uniforms: {
                speed: clampedSpeed,
            },
        });

        this.viewer.scene.postProcessStages.add(weatherStage);
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
