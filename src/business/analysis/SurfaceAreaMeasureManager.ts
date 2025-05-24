import { ScreenSpaceEventType, Entity, Viewer } from 'cesium';
import { BaseMeasureManager } from './BaseMeasureManager';
import { createDrawMessage } from '@/tools/message';
import { FeatureController } from '@/fetch/query';
import { FeatureAttrType, GetFeatureMode } from '@/fetch/types';
import { overturn } from '@/utils/math';

export class SurfaceAreaMeasureManager extends BaseMeasureManager {
	private featureController: FeatureController;

	constructor(viewer: Viewer) {
		super(viewer, 'SURFACE');

		console.log('SurfaceAreaMeasureManager 构造函数被调用');
		this.featureController = new FeatureController();
	}

	startMeasure(): void {
		super.startMeasure();
		// 清空所有实体
		this.viewer.entities.removeAll();
		this.initMeasureEvents();
	}

	protected initMeasureEvents(): void {
		if (!this.handler) {
			console.error('事件处理器未初始化');
			return;
		}

		console.log('初始化表面积测量事件');
		// 显示绘制提示
		this.drawMessage = createDrawMessage();
		this.drawMessage.show('点击模型获取表面积信息');

		// 左键点击事件
		this.handler.setInputAction(
			this.handleLeftClick.bind(this),
			ScreenSpaceEventType.LEFT_CLICK
		);
	}

	private handleLeftClick = (movement: any) => {
		const pick = this.viewer.scene.pick(movement.position);
		if (pick && pick.id) {
			this.getModelSurfaceArea(pick);
		}
	};

	async getModelSurfaceArea(entity: any) {
		try {
			console.log('获取实体信息:', entity.id, entity.primitive.name);
			const data =
				await this.featureController.query<FeatureAttrType.MODEL>({
					ids: [Number(entity.id)],
					datasetNames: [overturn(entity.primitive.name) || ''],
					getFeatureMode: GetFeatureMode.ID,
				});

			if (data && data.features && data.features.length > 0) {
				console.log('获取到的数据:', data);
				const attribute = data.features[0].attribute;
				this.showMeasureResult([attribute]);
			} else {
				console.warn('未获取到实体数据');
			}
		} catch (error) {
			console.error('获取模型表面积失败:', error);
		}
	}

	public destroy(): void {
		super.destroy();
		this.measuring = false;

		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}

		if (this.drawMessage) {
			this.drawMessage.destroy();
			this.drawMessage = null;
		}
	}
}
