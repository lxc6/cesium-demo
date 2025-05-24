import React from 'react';
import { PopupBase } from './PopupBase';
import MeasureInfoPopup from './MeasureInfoPopup';
import { MeasureInfo, MeasureType } from '@/business/analysis/types';

/**
 * 测量信息接口
 */
export interface SegmentInfo {
	// 线段测量
	segmentName?: string;
	startPoint?: string;
	endPoint?: string;
	distance?: string;
	verticalDistance?: string;
	horizontalDistanceX?: string;
	horizontalDistanceY?: string;

	// 面积测量
	vertexCount?: number;
	perimeter?: string;
	area?: string;

	// 表面积测量
	deviceId?: string;
	surfaceArea?: string;
}

/**
 * 面积测量信息接口
 */
export interface AreaMeasureResult {
	vertexCount: number;
	perimeter: string;
	area: string;
}

/**
 * 测量信息弹窗管理器
 */
export class MeasureInfoPopupManager extends PopupBase {
	private static instance: MeasureInfoPopupManager | null = null;
	private currentMeasureType: MeasureType = 'LINE';

	/**
	 * 获取单例实例
	 */
	public static getInstance(): MeasureInfoPopupManager {
		console.log('获取 MeasureInfoPopupManager 实例');
		if (!MeasureInfoPopupManager.instance) {
			console.log('创建新的 MeasureInfoPopupManager 实例');
			MeasureInfoPopupManager.instance = new MeasureInfoPopupManager();
		}
		return MeasureInfoPopupManager.instance;
	}

	/**
	 * 私有构造函数，确保单例模式
	 */
	private constructor() {
		super();
		console.log('初始化 MeasureInfoPopupManager');
		// 设置默认挂载容器为地图容器
		this.setMountContainer(
			() =>
				(document.querySelector('.map-container') as HTMLElement) ||
				(document.querySelector('.cesium-viewer') as HTMLElement) ||
				document.body
		);
	}

	/**
	 * 清理弹窗
	 */
	public cleanup() {
		console.log('清理弹窗');
		this.close();
	}

	/**
	 * 显示测量信息弹窗
	 * @param measureInfo 测量信息
	 * @param measureType 测量类型
	 */
	public showMeasureInfo(
		measureInfo: SegmentInfo[] | AreaMeasureResult,
		measureType: MeasureType = 'LINE'
	): void {
		console.log('显示测量信息弹窗', { measureInfo, measureType });

		try {
			// 如果已经有弹窗打开，先清理
			if (this.isOpen()) {
				console.log('已有弹窗打开，先清理');
				this.cleanup();
			}

			this.currentMeasureType = measureType;

			// 确保挂载到正确的容器
			const container =
				document.querySelector('.map-container') ||
				document.querySelector('.cesium-viewer');
			if (!container) {
				console.error('找不到地图容器');
				return;
			}

			// 格式化面积测量数据
			let displayData: SegmentInfo[];
			if (measureType === 'AREA' && !Array.isArray(measureInfo)) {
				// 将AreaMeasureResult转换为SegmentInfo[]格式
				const areaResult = measureInfo as AreaMeasureResult;
				displayData = [
					{
						vertexCount: areaResult.vertexCount,
						perimeter: areaResult.perimeter,
						area: areaResult.area,
					},
				];
			} else {
				displayData = measureInfo as SegmentInfo[];
			}

			console.log('渲染组件到容器:', { displayData, measureType });
			this.renderComponent(MeasureInfoPopup, {
				measureInfo: displayData,
				measureType: this.currentMeasureType,
				onClose: () => this.cleanup(),
				getContainer: container,
				parentClassName: container.className,
			});
			console.log('弹窗渲染完成');
		} catch (error) {
			console.error('显示测量信息弹窗时出错:', error);
		}
	}
}

// 导出单例实例
export const measureInfoPopup = MeasureInfoPopupManager.getInstance();
