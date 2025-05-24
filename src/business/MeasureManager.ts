import { Viewer } from 'cesium';
import { MeasureType } from './analysis/types';
import { LineMeasureManager } from './analysis/LineMeasureManager';
import { AreaMeasureManager } from './analysis/AreaMeasureManager';
import { SurfaceAreaMeasureManager } from './analysis/SurfaceAreaMeasureManager';
import { BaseMeasureManager } from './analysis/BaseMeasureManager';
import { measureInfoPopup } from '@/components/popup/MeasureInfoPopupManager';

/**
 * 测量管理器类，用于管理所有测量功能
 */
export class MeasureManager {
	private viewer: Viewer;
	private currentManager:
		| BaseMeasureManager
		| AreaMeasureManager
		| LineMeasureManager
		| SurfaceAreaMeasureManager
		| null = null;
	private static instance: MeasureManager | null = null;
	private isActive: boolean = false;

	/**
	 * 获取单例实例
	 */
	public static getInstance(viewer: Viewer): MeasureManager {
		if (!MeasureManager.instance) {
			MeasureManager.instance = new MeasureManager(viewer);
		}
		return MeasureManager.instance;
	}

	/**
	 * 私有构造函数，确保单例模式
	 */
	private constructor(viewer: Viewer) {
		console.log('初始化 MeasureManager');
		this.viewer = viewer;
		this.initKeyboardEvents();
	}

	/**
	 * 初始化键盘事件
	 */
	private initKeyboardEvents(): void {
		document.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key === 'Escape' && this.isActive) {
				console.log('ESC 键被按下，停止测量');
				this.stopMeasure();
			}
		});
	}

	/**
	 * 开始测量
	 * @param type 测量类型
	 */
	public startMeasure(type: MeasureType): void {
		console.log('开始测量', type);

		// 如果当前有测量进行中，先停止
		if (this.isActive) {
			this.stopMeasure();
		}

		// 清理所有测量相关的实体和背景
		this.clearAllMeasureEntities();
		this.clearMapBackground();

		// 根据类型创建对应的测量管理器
		switch (type) {
			case 'LINE':
				console.log('创建线段测量管理器');
				this.currentManager = new LineMeasureManager(this.viewer);
				break;
			case 'AREA':
				console.log('创建面积测量管理器');
				this.currentManager = new AreaMeasureManager(this.viewer);
				break;
			case 'SURFACE':
				console.log('创建表面积测量管理器');
				this.currentManager = new SurfaceAreaMeasureManager(
					this.viewer
				);
				return;
		}

		// 开始测量
		if (this.currentManager) {
			console.log('调用测量管理器的 startMeasure 方法');
			this.currentManager.startMeasure();
			this.isActive = true;
		}
	}

	/**
	 * 清理所有测量相关的实体
	 */
	private clearAllMeasureEntities(): void {
		console.log('清理所有测量相关的实体');

		// 清理所有以 measure_ 开头的实体
		const entitiesToRemove = [];
		for (let i = 0; i < this.viewer.entities.values.length; i++) {
			const entity = this.viewer.entities.values[i];
			if (
				entity.id &&
				(entity.id.startsWith('measure_') ||
					entity.id.startsWith('vertex_') ||
					entity.id.startsWith('label_') ||
					entity.id.startsWith('temp_'))
			) {
				entitiesToRemove.push(entity);
			}
		}

		entitiesToRemove.forEach((entity) => {
			console.log('移除测量实体:', entity.id);
			this.viewer.entities.remove(entity);
		});

		console.log(`清理了 ${entitiesToRemove.length} 个测量实体`);
	}

	/**
	 * 清理地图背景
	 */
	private clearMapBackground(): void {
		// 重置地图视图
		this.viewer.scene.globe.enableLighting = true;
		this.viewer.scene.globe.showGroundAtmosphere = true;
		this.viewer.scene.fog.enabled = true;
		this.viewer.scene.skyAtmosphere!.show = true;

		// 清除所有图层
		this.viewer.scene.primitives.removeAll();
		this.viewer.dataSources.removeAll();

		// 重置相机视角
		this.viewer.camera.setView({
			destination: this.viewer.camera.position,
			orientation: {
				heading: this.viewer.camera.heading,
				pitch: this.viewer.camera.pitch,
				roll: this.viewer.camera.roll,
			},
		});
	}

	/**
	 * 停止测量
	 */
	public stopMeasure(): void {
		console.log('停止测量');
		if (this.currentManager) {
			this.currentManager.destroy();
			this.currentManager = null;
		}
		// 确保清理弹窗
		measureInfoPopup.cleanup();
		// 清理所有测量相关的实体
		this.clearAllMeasureEntities();
		this.isActive = false;
	}

	/**
	 * 是否正在测量
	 */
	public isMeasuring(): boolean {
		return this.isActive;
	}

	/**
	 * 获取当前测量类型
	 */
	public getCurrentMeasureType(): MeasureType | null {
		return this.currentManager ? this.currentManager.measureType : null;
	}

	/**
	 * 销毁管理器
	 */
	public destroy(): void {
		this.stopMeasure();
		this.clearAllMeasureEntities();
		this.clearMapBackground();
		document.removeEventListener('keydown', this.initKeyboardEvents);
		MeasureManager.instance = null;
	}
}
