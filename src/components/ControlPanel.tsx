import { useCesiumStore } from '@/store/cesium';
import { CoreScene } from '../core/CoreScene';
import LocationControls from './LocationControls';
import WeatherControls from './WeatherControls';
import DrawControls from './DrawControls';
import { DrawManager, DrawMode } from '@/business/DrawManager';

import './ControlPanel.scss';
import { useEffect, useRef } from 'react';

interface ControlPanelProps {
    onFlyTo: (location: any) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onFlyTo }) => {
    // 从 store 获取全局状态
    const { coreCesium, isReady } = useCesiumStore();
    const drawManagerRef = useRef<DrawManager | null>(null);

    useEffect(() => {
        if (coreCesium?.viewer) {
            drawManagerRef.current = new DrawManager(coreCesium.viewer);
        }
        return () => {
            drawManagerRef.current?.destroy();
        };
    }, [coreCesium?.viewer]);

    const handleStartDraw = (mode: DrawMode) => {
        drawManagerRef.current?.startDraw(mode);
    };
    return (
        <div className='control-panel'>
            {isReady && (
                <>
                    <LocationControls onFlyTo={onFlyTo} />
                    <WeatherControls />
                    <DrawControls onStartDraw={handleStartDraw} />
                </>
            )}
        </div>
    );
};

export default ControlPanel;
