import { CameraOptions, FlyToOptions } from '../types/camera';

/**
 * 相机管理器类
 * 用于控制场景相机的位置、方向等属性
 */
export class CameraManager {
	private viewer: Cesium.Viewer;

	/**
	 * 构造函数
	 * @param viewer Cesium Viewer实例
	 */
	constructor(viewer: Cesium.Viewer) {
		this.viewer = viewer;
		this.initCameraEvents();
	}

	/**
	 * 初始化相机事件监听
	 * 监听相机变化事件，可用于实现相机位置变化的回调
	 * @private
	 */
	private initCameraEvents(): void {
		this.viewer.camera.changed.addEventListener(() => {
			// 相机变化事件处理
		});
	}

	/**
	 * 相机飞行到指定位置
	 * @param options 飞行选项
	 * @param options.position 目标位置{longitude, latitude, height}
	 * @param options.heading 航向角(度)，默认0
	 * @param options.pitch 俯仰角(度)，默认-45
	 * @param options.roll 翻滚角(度)，默认0
	 * @param options.duration 飞行时间(秒)，默认2
	 * @returns Promise 飞行完成后resolve
	 */
	public flyTo(options: FlyToOptions): Promise<void> {
		const {
			position,
			heading = 0,
			pitch = -45,
			roll = 0,
			duration = 2,
		} = options;

		console.log('options', options);

		return new Promise<void>((resolve) => {
			this.viewer.camera.flyTo({
				destination: Cesium.Cartesian3.fromDegrees(
					position.longitude,
					position.latitude,
					position.height
				),
				orientation: {
					heading: Cesium.Math.toRadians(heading),
					pitch: Cesium.Math.toRadians(pitch),
					roll: Cesium.Math.toRadians(roll),
				},
				duration,
				complete: resolve,
			});
		});
	}

	/**
	 * 获取当前相机位置和姿态
	 * @returns 相机当前状态，包含经度、纬度、高度、航向角、俯仰角、翻滚角
	 */
	public getCurrentPosition(): CameraOptions {
		const camera = this.viewer.camera;
		const position = camera.positionCartographic;

		return {
			longitude: Cesium.Math.toDegrees(position.longitude),
			latitude: Cesium.Math.toDegrees(position.latitude),
			height: position.height,
			heading: Cesium.Math.toDegrees(camera.heading),
			pitch: Cesium.Math.toDegrees(camera.pitch),
			roll: Cesium.Math.toDegrees(camera.roll),
		};
	}
}
