export const SCENE_STORE_NAMESPACE = 'scene3d';

export interface BaseConfig {
    sm3dRvtDataService: string;
    sm3dRvtService: string;
    sm3dRvtWorkSpace: string;
    supermapIserverUrl: string;
    service3dUrl: string;
}

// 基础场景视图信息
export interface BasicInfo {
    id: string;
    name: string;
    type: number;
    createTime: number;
    uri: string;
    lonLat: string;
    yaw: number;
    pitch: number;
    height: number;
    lon: string;
    lat: string;
    info: {
        type: string;
        value: string;
    };
}

// 场景下图层信息
export interface SceneSubLayerInfo {
    id: string;
    sceneId: string;
    datasetMark: string;
    layerMark: string;
    name: string;
}

// 视图场景里列表
export interface MainViewInfo {
    data: any;
    basicInfo: BasicInfo;
    sceneList: Array<{
        datasourceMark: string;
        sceneMark: string;
        id: string;
        layers: SceneSubLayerInfo[];
    }>;
}
