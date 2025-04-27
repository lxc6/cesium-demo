import { ViewerOptions } from './viewer';

/** 场景配置接口 */
export interface SceneOptions extends ViewerOptions {
    /** 地形配置 */
    terrain?: {
        /** 地形服务URL */
        url: string;
        /** 是否请求法线 */
        requestVertexNormals?: boolean;
        /** 是否请求水面效果 */
        requestWaterMask?: boolean;
    };
    /** 默认底图提供者 */
    defaultImageryProvider?: any;
    /** 其他配置项 */
    [key: string]: any;
}
