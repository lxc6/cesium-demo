/**
 * 地形服务类
 * 用于处理地形相关的操作
 */
export class TerrainService {
	/**
	 * 构造函数
	 * @param viewer Cesium Viewer实例
	 */
	constructor(private viewer: Cesium.Viewer) {}

	/**
	 * 获取指定位置的地形高度
	 * @param longitude 经度(度)
	 * @param latitude 纬度(度)
	 * @returns Promise<高度值>
	 */
	public async getHeight(
		longitude: number,
		latitude: number
	): Promise<number> {
		const position = new Cesium.Cartographic(
			Cesium.Math.toRadians(longitude),
			Cesium.Math.toRadians(latitude)
		);
		const heights = await Cesium.sampleTerrainMostDetailed(
			this.viewer.terrainProvider,
			[position]
		);
		return heights[0].height;
	}

	/**
	 * 采样地形高度
	 * @param positions 需要采样的位置数组
	 * @returns Promise<采样结果>
	 */
	public async sampleTerrainHeight(
		positions: Cesium.Cartographic[]
	): Promise<Cesium.Cartographic[]> {
		return await Cesium.sampleTerrainMostDetailed(
			this.viewer.terrainProvider,
			positions
		);
	}

	/**
	 * 获取射线与地形的交点
	 * @param ray 射线
	 * @returns 交点坐标或undefined
	 */
	public getTerrainIntersection(
		ray: Cesium.Ray
	): Cesium.Cartesian3 | undefined {
		return this.viewer.scene.globe.pick(ray, this.viewer.scene);
	}

	/**
	 * 销毁地形服务
	 */
	public destroy(): void {
		// 清理相关资源
	}
}
