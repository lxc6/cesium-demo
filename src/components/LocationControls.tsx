import { useState } from 'react';
import { PRESET_LOCATIONS } from '@/config/coordinates';
import './LocationControls.scss';

interface LocationControlsProps {
    onFlyTo: (
        location: (typeof PRESET_LOCATIONS)[keyof typeof PRESET_LOCATIONS]
    ) => void;
}

const LocationControls: React.FC<LocationControlsProps> = ({ onFlyTo }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeLocation, setActiveLocation] = useState<string>('HAINAN');

    const handleLocationChange = (
        key: string,
        location: (typeof PRESET_LOCATIONS)[keyof typeof PRESET_LOCATIONS]
    ) => {
        setActiveLocation(key);
        onFlyTo(location);
    };

    return (
        <div
            className={`location-controls ${
                isExpanded ? 'expanded' : 'collapsed'
            }`}
        >
            <div
                className='location-header'
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>位置切换</span>
                <span className='toggle-icon'>{isExpanded ? '−' : '+'}</span>
            </div>
            {isExpanded && (
                <div className='location-content'>
                    {Object.entries(PRESET_LOCATIONS).map(([key, location]) => (
                        <button
                            key={key}
                            className={activeLocation === key ? 'active' : ''}
                            onClick={() => handleLocationChange(key, location)}
                        >
                            {location.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocationControls;
