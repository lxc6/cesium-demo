/** Cesium事件接口 */
export interface CesiumEvent {
    /** 事件位置 */
    position?: Cesium.Cartesian2;
    /** 开始位置(用于拖拽等事件) */
    startPosition?: Cesium.Cartesian2;
    /** 结束位置(用于拖拽等事件) */
    endPosition?: Cesium.Cartesian2;
    [key: string]: any;
}

/** 拾取要素接口 */
export interface PickedFeature {
    /** 要素ID */
    id?: string;
    /** 拾取的图元 */
    primitive?: any;
    /** 拾取位置 */
    position?: Cesium.Cartesian3;
    [key: string]: any;
}

/** 事件回调函数类型 */
export type EventCallback = (feature: PickedFeature) => void;
