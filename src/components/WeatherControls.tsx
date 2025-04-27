import { useState, useEffect } from 'react';
import { CoreScene } from '../core/CoreScene';
import './WeatherControls.scss';

interface WeatherControlsProps {
    coreCesium: CoreScene;
}

const WeatherControls: React.FC<WeatherControlsProps> = ({ coreCesium }) => {
    const [weatherType, setWeatherType] = useState<'none' | 'rain' | 'snow'>(
        'none'
    );
    const [intensity, setIntensity] = useState(0.5);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // 检查场景是否准备就绪
        if (coreCesium && coreCesium.viewer && !coreCesium.isSceneDestroyed) {
            setIsReady(true);
        }
    }, [coreCesium]);

    const handleWeatherChange = (type: 'none' | 'rain' | 'snow') => {
        if (!isReady) return;
        try {
            setWeatherType(type);
            coreCesium.setWeatherEffect(type, intensity);
        } catch (error) {
            console.error('设置天气效果失败:', error);
        }
    };

    const handleIntensityChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!isReady) return;
        try {
            const value = parseFloat(event.target.value) / 100;
            setIntensity(value);
            coreCesium.setWeatherEffect(weatherType, value);
        } catch (error) {
            console.error('设置天气强度失败:', error);
        }
    };

    return (
        <div
            className={`weather-controls ${
                isExpanded ? 'expanded' : 'collapsed'
            }`}
        >
            <div
                className='weather-header'
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>天气效果</span>
                <span className='toggle-icon'>{isExpanded ? '−' : '+'}</span>
            </div>
            {isExpanded && (
                <div className='weather-content'>
                    <div className='weather-buttons'>
                        <button
                            className={weatherType === 'none' ? 'active' : ''}
                            onClick={() => handleWeatherChange('none')}
                            disabled={!isReady}
                        >
                            晴天
                        </button>
                        <button
                            className={weatherType === 'rain' ? 'active' : ''}
                            onClick={() => handleWeatherChange('rain')}
                            disabled={!isReady}
                        >
                            下雨
                        </button>
                        <button
                            className={weatherType === 'snow' ? 'active' : ''}
                            onClick={() => handleWeatherChange('snow')}
                            disabled={!isReady}
                        >
                            下雪
                        </button>
                    </div>
                    <div className='intensity-control'>
                        <span>速度调节</span>
                        <div className='slider-container'>
                            <input
                                type='range'
                                min='0'
                                max='100'
                                value={intensity * 100}
                                onChange={handleIntensityChange}
                                disabled={!isReady || weatherType === 'none'}
                            />
                            <span>{Math.round(intensity * 100)}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherControls;
