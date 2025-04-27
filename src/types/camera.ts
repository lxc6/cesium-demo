/** 相机位置接口 */
export interface CameraPosition {
	/** 经度(度) */
	longitude: number;
	/** 纬度(度) */
	latitude: number;
	/** 高度(米) */
	height: number;
}

/** 相机方向接口 */
export interface CameraOrientation {
	/** 航向角(度) */
	heading?: number;
	/** 俯仰角(度) */
	pitch?: number;
	/** 翻滚角(度) */
	roll?: number;
}

/** 相机完整配置接口 */
export interface CameraOptions extends CameraPosition, CameraOrientation {}

/** 相机飞行配置接口 */
export interface FlyToOptions extends CameraOrientation {
	/** 目标位置 */
	position: CameraPosition;
	/** 飞行持续时间(秒) */
	duration?: number;
}
