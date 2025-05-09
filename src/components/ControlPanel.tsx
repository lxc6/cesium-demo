import { useCesiumStore } from '@/store/cesium';
import { CoreScene } from '../core/CoreScene';
import LocationControls from './LocationControls';
import WeatherControls from './WeatherControls';

import './ControlPanel.scss';
import { useEffect } from 'react';

interface ControlPanelProps {
    onFlyTo: (location: any) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onFlyTo }) => {
    // 从 store 获取全局状态
    const { coreCesium, isReady } = useCesiumStore();
    useEffect(() => {
        // console.log('coreCesium', coreCesium);
    }, [coreCesium]);
    return (
        <div className='control-panel'>
            {isReady && (
                <>
                    <LocationControls onFlyTo={onFlyTo} />
                    <WeatherControls />
                </>
            )}
        </div>
    );
};

export default ControlPanel;
