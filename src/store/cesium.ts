import { create } from 'zustand';
import { CoreScene } from '@/core/CoreScene';
import axios from 'axios';

/** 基础配置接口 */
interface BaseConfig {
    /** 超图iServer URL */
    supermapIserverUrl: string;
    /** 超图iServer账号 */
    supermapIserverAccount?: string;
    /** 超图iServer密码 */
    supermapIserverPassword?: string;
    /** 3D数据服务 */
    sm3dDataService: string;
    /** 2D数据服务 */
    sm2dDataService: string;
    /** 地图服务 */
    mapService: string;
    /** 3D服务 */
    sm3dService: string;
    /** 3D RVT数据服务 */
    sm3dRvtDataService: string;
    /** 3D RVT服务 */
    sm3dRvtService: string;
    /** 空间分析服务 */
    spatialAnalysisService: string;
    /** 左下角坐标 */
    leftBottom: string;
    /** 右上角坐标 */
    topRight: string;
    /** 中心点坐标 */
    centerPoint: string;
    /** 工作空间 */
    workspace: string;
    /** 3D工作空间 */
    sm3dWorkspace: string;
    /** EPSG投影 */
    epsg: string;
    /** EPSG代码 */
    epsgCode: number;
    /** 底图服务 */
    basemapService: string;
    /** 3D服务URL */
    service3dUrl: string;
}

/** 场景图层信息接口 */
interface SceneLayerInfo {
    /** 图层ID */
    id: string;
    /** 图层名称 */
    name: string;
    /** 图层类型 */
    type: string;
    /** 图层可见性 */
    visible: boolean;
    /** 图层透明度 */
    opacity: number;
}

/** 场景视图信息接口 */
interface SceneViewInfo {
    /** 场景ID */
    id: string;
    /** 场景名称 */
    name: string;
    /** 场景类型 */
    type: string;
    /** 相机位置 */
    camera: {
        longitude: number;
        latitude: number;
        height: number;
        heading: number;
        pitch: number;
        roll: number;
    };
    /** 场景图层列表 */
    layers: SceneLayerInfo[];
}

/** Cesium 状态管理接口 */
interface CesiumStore {
    /** 核心场景实例 */
    coreCesium: CoreScene | null;
    /** 场景是否准备就绪 */
    isReady: boolean;
    /** 分析工具是否激活 */
    isAnalysisActive: boolean;
    /** 测量工具是否激活 */
    isMeasureActive: boolean;
    /** 绘制工具是否激活 */
    isDrawActive: boolean;
    /** 当前激活的工具类型 */
    activeToolType: 'analysis' | 'measure' | 'draw' | null;
    /** 基础配置 */
    baseConfig: BaseConfig;
    /** 当前场景信息 */
    currentScene: SceneViewInfo | null;
    /** 场景图层列表 */
    layers: SceneLayerInfo[];

    /** 设置核心场景实例 */
    setCoreCesium: (scene: CoreScene | null) => void;
    /** 设置场景准备状态 */
    setIsReady: (ready: boolean) => void;
    /** 设置分析工具状态 */
    setAnalysisActive: (active: boolean) => void;
    /** 设置测量工具状态 */
    setMeasureActive: (active: boolean) => void;
    /** 设置绘制工具状态 */
    setDrawActive: (active: boolean) => void;
    /** 设置当前激活的工具类型 */
    setActiveToolType: (type: 'analysis' | 'measure' | 'draw' | null) => void;
    /** 设置基础配置 */
    setBaseConfig: (config: Partial<BaseConfig>) => void;
    /** 获取基础配置 */
    getBaseConfig: () => Promise<boolean>;
    /** 设置当前场景信息 */
    setCurrentScene: (scene: SceneViewInfo) => void;
    /** 更新图层状态 */
    updateLayer: (layerId: string, updates: Partial<SceneLayerInfo>) => void;
}

/**
 * Cesium 全局状态管理
 * 用于管理 Cesium 场景实例和状态
 */
export const useCesiumStore = create<CesiumStore>((set) => ({
    // 初始状态
    coreCesium: null,
    isReady: false,
    isAnalysisActive: false,
    isMeasureActive: false,
    isDrawActive: false,
    activeToolType: null,
    baseConfig: {
        supermapIserverUrl: '',
        sm3dDataService: '',
        sm2dDataService: '',
        mapService: '',
        sm3dService: '',
        sm3dRvtDataService: '',
        sm3dRvtService: '',
        spatialAnalysisService: '',
        leftBottom: '',
        topRight: '',
        centerPoint: '',
        workspace: '',
        sm3dWorkspace: '',
        epsg: '',
        epsgCode: 0,
        basemapService: '',
        service3dUrl: '',
    },
    currentScene: null,
    layers: [],

    // 状态更新方法
    setCoreCesium: (scene) => set({ coreCesium: scene }),
    setIsReady: (ready) => set({ isReady: ready }),
    setAnalysisActive: (active) =>
        set((state) => {
            if (active) {
                return {
                    isAnalysisActive: true,
                    isMeasureActive: false,
                    isDrawActive: false,
                    activeToolType: 'analysis',
                };
            }
            return {
                isAnalysisActive: false,
                activeToolType:
                    state.activeToolType === 'analysis'
                        ? null
                        : state.activeToolType,
            };
        }),
    setMeasureActive: (active) =>
        set((state) => {
            if (active) {
                return {
                    isAnalysisActive: false,
                    isMeasureActive: true,
                    isDrawActive: false,
                    activeToolType: 'measure',
                };
            }
            return {
                isMeasureActive: false,
                activeToolType:
                    state.activeToolType === 'measure'
                        ? null
                        : state.activeToolType,
            };
        }),
    setDrawActive: (active) =>
        set((state) => {
            if (active) {
                return {
                    isAnalysisActive: false,
                    isMeasureActive: false,
                    isDrawActive: true,
                    activeToolType: 'draw',
                };
            }
            return {
                isDrawActive: false,
                activeToolType:
                    state.activeToolType === 'draw'
                        ? null
                        : state.activeToolType,
            };
        }),
    setActiveToolType: (type) =>
        set({
            activeToolType: type,
            isAnalysisActive: type === 'analysis',
            isMeasureActive: type === 'measure',
            isDrawActive: type === 'draw',
        }),

    setBaseConfig: (config) =>
        set((state) => ({
            baseConfig: { ...state.baseConfig, ...config },
        })),

    /** 获取基础配置 */
    getBaseConfig: async () => {
        try {
            const response = await axios.get('/basic_config_view.json');
            const data = response.data;

            set({
                baseConfig: {
                    ...data,
                    supermapIserverUrl: data.supermap_iserver_url,
                    sm3dDataService: data.sm3d_data_service,
                    sm2dDataService: data.sm2d_data_service,
                    sm3dService: data.sm3d_service,
                    sm3dRvtDataService: data.sm3d_rvt_data_service,
                    sm3dRvtService: data.sm3d_rvt_service,
                    service3dUrl: `${data.supermap_iserver_url}/iserver/services/${data.sm3d_rvt_service}/rest/realspace`,
                },
                isReady: true,
            });
            console.info('获取场景基础配置: 成功');
            return true;
        } catch (error) {
            console.error('获取场景基础配置: 失败', error);
            return false;
        }
    },

    setCurrentScene: (scene) =>
        set({
            currentScene: scene,
            layers: scene.layers,
        }),

    updateLayer: (layerId, updates) =>
        set((state) => ({
            layers: state.layers.map((layer) =>
                layer.id === layerId ? { ...layer, ...updates } : layer
            ),
        })),
}));
