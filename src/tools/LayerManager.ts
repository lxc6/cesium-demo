import { ImageryLayerOptions, TerrainProviderOptions } from '../types/layer';

export class LayerManager {
	private imageryLayers: Map<string, Cesium.ImageryLayer> = new Map();
	private terrainLayers: Map<string, Cesium.TerrainProvider> = new Map();
	private viewer: Cesium.Viewer;

	/**
	 * 构造函数
	 * @param viewer Cesium Viewer实例
	 */
	constructor(viewer: Cesium.Viewer) {
		this.viewer = viewer;
	}

	/**
	 * 添加影像图层
	 * @param id 图层唯一标识
	 * @param provider 影像提供者
	 * @returns 创建的影像图层
	 */
	public addImageryLayer(
		id: string,
		options: ImageryLayerOptions
	): Cesium.ImageryLayer {
		if (!options.provider) {
			throw new Error('影像提供者不能为空');
		}
		const layer = new Cesium.ImageryLayer(options.provider);
		this.viewer.imageryLayers.add(layer);
		this.imageryLayers.set(id, layer);
		return layer;
	}

	/**
	 * 直接添加影像提供者
	 * @param id 图层唯一标识
	 * @param provider 影像提供者
	 * @returns 创建的影像图层
	 */
	public addImageryProvider(
		id: string,
		provider: Cesium.ImageryProvider
	): Cesium.ImageryLayer {
		if (!this.viewer?.scene || this.viewer.scene.isDestroyed()) {
			throw new Error('Cesium场景未完全初始化，请等待场景就绪后再添加图层');
		}
		if (!this.viewer.imageryLayers) {
			throw new Error('Cesium图层管理器未初始化');
		}
		try {
			const layer = this.viewer.imageryLayers.addImageryProvider(provider);
			this.imageryLayers.set(id, layer);
			return layer;
		} catch (error) {
			console.error('添加图层失败:', error);
			throw error;
		}
	}

	/**
	 * 移除影像图层
	 * @param id 图层ID
	 */
	public removeImageryLayer(id: string): void {
		const layer = this.imageryLayers.get(id);
		if (layer) {
			this.viewer.imageryLayers.remove(layer);
			this.imageryLayers.delete(id);
		}
	}

	/**
	 * 设置地形图层
	 * @param id 地形图层ID
	 * @param options 地形选项
	 * @param options.url 地形服务URL
	 * @param options.requestVertexNormals 是否请求顶点法线
	 * @param options.requestWaterMask 是否请求水面遮罩
	 * @returns 创建的地形提供者
	 */
	public setTerrainProvider(
		id: string,
		options: TerrainProviderOptions
	): Cesium.CesiumTerrainProvider {
		const terrainProvider = new Cesium.CesiumTerrainProvider({
			url: options.url,
			requestVertexNormals: options.requestVertexNormals,
			requestWaterMask: options.requestWaterMask,
		});

		this.viewer.terrainProvider = terrainProvider;
		this.terrainLayers.set(id, terrainProvider);

		return terrainProvider;
	}

	/**
	 * 销毁所有图层并清理资源
	 */
	public destroy(): void {
		this.imageryLayers.forEach((layer) => {
			this.viewer.imageryLayers.remove(layer);
		});
		this.imageryLayers.clear();
		this.terrainLayers.clear();
	}
}
