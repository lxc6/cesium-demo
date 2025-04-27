import { useCesiumStore } from '@/store/cesium';
import { CoreScene } from '../core/CoreScene';
import LocationControls from './LocationControls';
import WeatherControls from './WeatherControls';

import './ControlPanel.scss';

interface ControlPanelProps {
	coreCesium?: CoreScene | null;
	isReady?: boolean;
	onFlyTo: (location: any) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onFlyTo }) => {
	// 从 store 获取全局状态
	const { coreCesium, isReady } = useCesiumStore();
	return (
		<div className='control-panel'>
			{isReady && (
				<>
					<LocationControls onFlyTo={onFlyTo} />
					{coreCesium && <WeatherControls coreCesium={coreCesium} />}
				</>
			)}
		</div>
	);
};

export default ControlPanel;
