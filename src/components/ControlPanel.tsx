import { useCesiumStore } from '@/store/cesium';
import { CoreScene } from '../core/CoreScene';
import LocationControls from './LocationControls';
import WeatherControls from './WeatherControls';
import DrawControls from './DrawControls';
import LayerControls from './LayerControls';
import { MeasureTools } from './MeasureTools';
import ExcavationControls from './ExcavationControls';
import { DrawManager, DrawMode } from '@/business/DrawManager';
import { MeasureManager } from '@/business/MeasureManager';
import { MeasureType } from '@/business/analysis/types';
import { ExcavationManager } from '@/business/ExcavationManager';
import { measureInfoPopup } from '@/components/popup/MeasureInfoPopupManager';

import './ControlPanel.scss';
import { useEffect, useRef } from 'react';

interface ControlPanelProps {
	onFlyTo: (location: any) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onFlyTo }) => {
	// 从 store 获取全局状态
	const { coreCesium, isReady } = useCesiumStore();
	const drawManagerRef = useRef<DrawManager | null>(null);
	const measureManagerRef = useRef<MeasureManager | null>(null);
	const excavationManagerRef = useRef<ExcavationManager | null>(null);

	useEffect(() => {
		if (coreCesium?.viewer) {
			drawManagerRef.current = new DrawManager(coreCesium.viewer);
			measureManagerRef.current = MeasureManager.getInstance(
				coreCesium.viewer
			);
			excavationManagerRef.current = new ExcavationManager(
				coreCesium.viewer
			);
		}
		return () => {
			drawManagerRef.current?.destroy();
			measureManagerRef.current?.destroy();
			excavationManagerRef.current?.destroy();
		};
	}, [coreCesium?.viewer]);

	const handleStartDraw = (mode: DrawMode) => {
		drawManagerRef.current?.startDraw(mode);
	};

	const handleStartExcavation = (depth: number) => {
		excavationManagerRef.current?.startExcavation(depth);
	};

	return (
		<div className='control-panel'>
			{isReady && (
				<>
					<LocationControls onFlyTo={onFlyTo} />
					<WeatherControls />
					{/* <DrawControls onStartDraw={handleStartDraw} /> */}
					{coreCesium?.viewer && (
						<MeasureTools viewer={coreCesium.viewer} />
					)}
					<ExcavationControls
						onStartExcavation={handleStartExcavation}
					/>
					<LayerControls />
				</>
			)}
		</div>
	);
};

export default ControlPanel;
