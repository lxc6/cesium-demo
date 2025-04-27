/** 影像图层配置接口 */
export interface ImageryLayerOptions {
	/** 服务URL */
	url?: string;
	/** 图层类型：WMS、WMTS、TMS等 */
	type?: 'WMS' | 'WMTS' | 'TMS' | 'URL';
	/** 图层名称 */
	layers?: string;
	/** 图层样式 */
	style?: string;
	/** 图片格式 */
	format?: string;
	/** WMTS瓦片矩阵集ID */
	tileMatrixSetID?: string;
	/** WMS参数 */
	parameters?: any;
	/** 最小层级 */
	minimumLevel?: number;
	/** 最大层级 */
	maximumLevel?: number;
	/** 透明度 */
	alpha?: number;
	/** 亮度 */
	brightness?: number;
	/** 对比度 */
	contrast?: number;
	/** 色调 */
	hue?: number;
	/** 饱和度 */
	saturation?: number;
	/** 伽马值 */
	gamma?: number;
	/** 提供者 */
	provider?: Cesium.ImageryProvider;
	/** 名称 */
	name?: string;
	/** 子域名 */
	subdomains?: string[];
}

/** 地形服务配置接口 */
export interface TerrainProviderOptions {
	/** 服务URL */
	url: string;
	/** 是否请求法线 */
	requestVertexNormals?: boolean;
	/** 是否请求水面效果 */
	requestWaterMask?: boolean;
}
