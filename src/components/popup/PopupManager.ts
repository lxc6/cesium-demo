import { PopupBase } from './PopupBase';
import {
	MeasureInfoPopupManager,
	measureInfoPopup,
	SegmentInfo,
} from './MeasureInfoPopupManager';

export type MeasureType = 'LINE' | 'AREA' | 'SURFACE';

/**
 * 弹窗管理器类
 * 用于统一管理所有类型的弹窗
 */
export class PopupManager {
	private static instance: PopupManager | null = null;
	private popups: Map<string, PopupBase> = new Map();

	/**
	 * 获取单例实例
	 * @returns PopupManager 单例实例
	 */
	public static getInstance(): PopupManager {
		if (!PopupManager.instance) {
			PopupManager.instance = new PopupManager();
		}
		return PopupManager.instance;
	}

	/**
	 * 私有构造函数，确保单例模式
	 */
	private constructor() {
		// 注册已知的弹窗类型
		this.registerPopup('measureInfo', measureInfoPopup);
	}

	/**
	 * 注册弹窗实例
	 * @param name 弹窗名称
	 * @param popup 弹窗实例
	 */
	public registerPopup(name: string, popup: PopupBase): void {
		this.popups.set(name, popup);
	}

	/**
	 * 获取弹窗实例
	 * @param name 弹窗名称
	 * @returns PopupBase | undefined 弹窗实例
	 */
	public getPopup(name: string): PopupBase | undefined {
		return this.popups.get(name);
	}

	/**
	 * 显示测量信息弹窗
	 * @param segmentInfos 线段信息数组
	 */
	public showMeasureInfo(
		segmentInfos: SegmentInfo[],
		measureType: MeasureType
	): void {
		const popup = this.getPopup('measureInfo') as MeasureInfoPopupManager;
		if (popup) {
			popup.showMeasureInfo(segmentInfos, measureType);
		}
	}

	/**
	 * 关闭指定名称的弹窗
	 * @param name 弹窗名称
	 */
	public closePopup(name: string): void {
		const popup = this.popups.get(name);
		if (popup) {
			popup.close();
		}
	}

	/**
	 * 关闭所有弹窗
	 */
	public closeAll(): void {
		this.popups.forEach((popup) => popup.close());
	}

	/**
	 * 销毁所有弹窗实例
	 */
	public destroy(): void {
		this.popups.forEach((popup) => popup.destroy());
		this.popups.clear();
	}
}

// 导出单例实例，方便直接使用
export const popupManager = PopupManager.getInstance();
