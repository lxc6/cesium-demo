/// <reference types="cesium" />

/**
 *  ---------------------------providers.ts-------------------------
 * */

/**
 * 地图服务提供者
 */

interface MapOptions {
	minimumLevel?: number;
	maximumLevel?: number;
}

// 必应地图
export function bingMap(options?: MapOptions) {
	return new Cesium.BingMapsImageryProvider({
		url: 'https://dev.virtualearth.net',
		key: 'AmXdbd8UeUJtaRSn7yVwyXgQlBBUqliLbHpgn2c76DfuHwAXfRrgS5qwfHU6Rhm8',
		mapStyle: Cesium.BingMapsStyle.AERIAL,
		...options,
	});
}

// 高德矢量底图
export function gaudVector(options?: MapOptions) {
	return new Cesium.UrlTemplateImageryProvider({
		url: 'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
		...options,
	});
}

// 高德影像地图
export function gaudImage() {
	return new Cesium.UrlTemplateImageryProvider({
		url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
		minimumLevel: 3,
		maximumLevel: 18,
	});
}

// 超图影像
export function superMap(options?: MapOptions) {
	return new Cesium.SuperMapImageryProvider({
		url: 'http://192.168.0.102:8090/iserver/services/map-ugcv5-ylgistest2basemapsceneud/rest/maps/ylgistest2basemapsceneud',
		...options,
	});
}
