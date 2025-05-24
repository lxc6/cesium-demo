import { create } from 'zustand';
import { Viewer } from 'cesium';
import { MeasureType } from '@/business/analysis/types';

interface MeasureState {
	activeMeasureType: MeasureType | null;
	measureManager: any | null;
	viewer: Viewer | null;
	setViewer: (viewer: Viewer) => void;
	startMeasure: (type: MeasureType) => void;
	stopMeasure: () => void;
	resetMapState: () => void;
}

export const useMeasureStore = create<MeasureState>((set, get) => ({
	activeMeasureType: null,
	measureManager: null,
	viewer: null,

	setViewer: (viewer: Viewer) => {
		set({ viewer });
	},

	startMeasure: async (type: MeasureType) => {
		const { viewer, measureManager, stopMeasure } = get();

		if (!viewer) return;

		// 如果已有测量进行中，先停止
		if (measureManager) {
			stopMeasure();
		}

		// 动态导入测量管理器
		try {
			let Manager;
			switch (type) {
				case 'LINE':
					const { LineMeasureManager } = await import(
						'@/business/analysis/LineMeasureManager'
					);
					Manager = LineMeasureManager;
					break;
				case 'AREA':
					const { AreaMeasureManager } = await import(
						'@/business/analysis/AreaMeasureManager'
					);
					Manager = AreaMeasureManager;
					break;
				case 'SURFACE':
					const { SurfaceAreaMeasureManager } = await import(
						'@/business/analysis/SurfaceAreaMeasureManager'
					);
					Manager = SurfaceAreaMeasureManager;
					break;
				default:
					return;
			}

			const newManager = new Manager(viewer);
			newManager.startMeasure();

			set({
				activeMeasureType: type,
				measureManager: newManager,
			});
		} catch (error) {
			console.error('加载测量管理器失败:', error);
		}
	},

	stopMeasure: () => {
		const { measureManager } = get();
		if (measureManager) {
			measureManager.destroy();
		}
		set({
			activeMeasureType: null,
			measureManager: null,
		});
	},

	resetMapState: () => {
		const { viewer } = get();
		if (viewer) {
			// 重置地图背景和其他状态
			viewer.scene.globe.enableLighting = false;
			viewer.scene.globe.enableTranslucency = false;
			viewer.scene.globe.showGroundAtmosphere = true;
			viewer.scene.globe.showWaterEffect = true;
		}
	},
}));
