import { Viewer, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import { MeasureInfo, MeasureType } from './types';
import { clearMeasureEntities, generateMeasureId } from './measureUtils';
import { measureInfoPopup } from '@/components/popup/MeasureInfoPopupManager';

export abstract class BaseMeasureManager {
	protected viewer: Viewer;
	protected handler: ScreenSpaceEventHandler | null = null;
	protected measuring: boolean = false;
	protected entityIds: string[] = [];
	protected _measureType: MeasureType;
	protected drawMessage: any = null;
	protected allEntities: any[] = []; // 存储所有创建的实体

	constructor(viewer: Viewer, measureType: MeasureType) {
		console.log('BaseMeasureManager 构造函数被调用', { measureType });
		this.viewer = viewer;
		this._measureType = measureType;
		this.initEventHandlers();
	}

	/**
	 * 获取测量类型
	 */
	public get measureType(): MeasureType {
		return this._measureType;
	}

	/**
	 * 初始化事件处理
	 */
	protected initEventHandlers() {
		console.log('初始化基础事件处理器');
		// 监听 ESC 键
		document.addEventListener('keydown', this.handleKeyDown);
	}

	/**
	 * 处理键盘事件
	 */
	protected handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			console.log('ESC 键被按下，取消测量');
			if (this.drawMessage) {
				this.drawMessage.destroy();
				this.drawMessage = null;
			}
			this.destroy();
			this.resetMapState();
		}
	};

	/**
	 * 重置地图状态
	 */
	protected resetMapState() {
		if (this.viewer) {
			this.viewer.scene.globe.enableLighting = true;
			this.viewer.scene.globe.showGroundAtmosphere = true;
			this.viewer.scene.fog.enabled = true;
			this.viewer.scene.skyAtmosphere!.show = true;
		}
	}

	/**
	 * 开始测量
	 */
	public startMeasure() {
		console.log('开始测量', this._measureType);
		if (this.measuring) {
			console.log('已经在测量中');
			return;
		}
		// 清除地图背景以提高显示效果
		this.viewer.scene.globe.enableLighting = false;
		this.viewer.scene.globe.showGroundAtmosphere = false;
		this.viewer.scene.fog.enabled = false;
		this.viewer.scene.skyAtmosphere!.show = false;

		this.measuring = true;
		this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
		console.log('创建事件处理器', this.handler);
		this.initMeasureEvents();
	}

	/**
	 * 初始化测量事件
	 */
	protected abstract initMeasureEvents(): void;

	/**
	 * 显示测量结果
	 */
	protected showMeasureResult(measureInfo: any) {
		console.log('准备显示测量结果', {
			measureInfo,
			measureType: this._measureType,
		});

		try {
			console.log('调用 measureInfoPopup.showMeasureInfo');
			measureInfoPopup.showMeasureInfo(measureInfo, this._measureType);
			console.log('测量结果显示成功');
		} catch (error) {
			console.error('显示测量结果时出错:', error);
		}
	}

	/**
	 * 生成实体ID
	 */
	protected generateEntityId(): string {
		const id = generateMeasureId(this._measureType);
		this.entityIds.push(id);
		return id;
	}

	/**
	 * 清理测量实体
	 */
	protected clearEntities() {
		console.log('清理测量实体');
		this.entityIds.forEach((id) => {
			const entity = this.viewer.entities.getById(id);
			if (entity) {
				this.viewer.entities.remove(entity);
			}
		});
		this.entityIds = [];
	}

	/**
	 * 添加实体到管理列表
	 */
	protected addEntityToManager(entity: any): void {
		if (entity) {
			console.log('添加实体到管理列表:', entity.id);
			this.allEntities.push(entity);
		}
	}

	/**
	 * 销毁测量管理器
	 */
	public destroy() {
		console.log('销毁测量管理器');
		// 移除事件监听
		document.removeEventListener('keydown', this.handleKeyDown);

		// 清理绘制句柄
		if (this.handler) {
			console.log('清理事件处理器');
			this.handler.destroy();
			this.handler = null;
		}

		// 清理提示信息
		if (this.drawMessage) {
			console.log('清理提示信息');
			this.drawMessage.destroy();
			this.drawMessage = null;
		}

		// 清理所有管理的实体
		console.log('清理所有管理的实体', this.allEntities.length);
		this.allEntities.forEach((entity) => {
			try {
				if (entity && this.viewer.entities.contains(entity)) {
					console.log('移除实体:', entity.id);
					this.viewer.entities.remove(entity);
				}
			} catch (error) {
				console.warn('清理实体时出错:', error);
			}
		});
		this.allEntities = [];

		// 清理实体
		this.clearEntities();

		// 关闭弹窗
		console.log('关闭测量信息弹窗');
		measureInfoPopup.cleanup();

		this.measuring = false;
		console.log('测量管理器销毁完成');
	}

	/**
	 * 是否正在测量
	 */
	public isMeasuring(): boolean {
		return this.measuring;
	}
}
