/** 实体位置接口 */
export interface EntityPosition {
    /** 经度(度) */
    longitude: number;
    /** 纬度(度) */
    latitude: number;
    /** 高度(米) */
    height?: number;
    [key: string]: any;
}

/** 实体配置接口 */
export interface EntityOptions {
    /** 实体唯一标识 */
    id: string;
    /** 实体位置 */
    position: EntityPosition;
    /** 点样式配置 */
    point?: Cesium.PointGraphics | undefined;
    /** 标签配置 */
    label?: Cesium.LabelGraphics | undefined;
    [key: string]: any;
}
