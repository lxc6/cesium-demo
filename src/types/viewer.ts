/** Cesium视图配置接口 */
export interface ViewerOptions {
    /** 是否显示动画控件 */
    animation?: boolean;
    /** 是否显示底图切换控件 */
    baseLayerPicker?: boolean;
    /** 是否显示全屏控件 */
    fullscreenButton?: boolean;
    /** 是否显示地名查找控件 */
    geocoder?: boolean;
    /** 是否显示主页按钮 */
    homeButton?: boolean;
    /** 是否显示信息框 */
    infoBox?: boolean;
    /** 是否显示场景模式切换控件 */
    sceneModePicker?: boolean;
    /** 是否显示时间轴 */
    timeline?: boolean;
    /** 是否显示帮助按钮 */
    navigationHelpButton?: boolean;
    /** WebGL上下文配置 */
    contextOptions?: {
        /** WebGL配置 */
        webgl?: {
            /** 是否启用透明 */
            alpha?: boolean;
            /** 是否启用深度测试 */
            depth?: boolean;
            /** 是否启用模板测试 */
            stencil?: boolean;
            /** 是否启用抗锯齿 */
            antialias?: boolean;
            /** 是否启用预乘alpha */
            premultipliedAlpha?: boolean;
            /** 是否保留绘图缓冲 */
            preserveDrawingBuffer?: boolean;
            /** 是否在性能较差时失败 */
            failIfMajorPerformanceCaveat?: boolean;
        };
    };
} 