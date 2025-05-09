import { useEffect } from 'react';
import { useCesium } from '@/hooks/useCesium';
import { PickedFeature } from '@/types/events';
import ControlPanel from '@/components/ControlPanel';
import { PRESET_LOCATIONS } from '@/config/coordinates';
import { superMap, localMap } from '@/utils/providers';
import './index.scss';

const CesiumDemo = () => {
    const { isReady, camera } = useCesium('cesiumContainer', {
        // defaultImageryProvider: localMap(), // 加载厂区 超图高清底图  安庆
        defaultImageryProvider: superMap(), // 加载厂区 超图高清底图  榆林
        // terrainProvider: Cesium.createWorldTerrain(), // 加载地形
    });

    useEffect(() => {
        if (camera) {
            // 设置默认位置  海南
            camera?.flyTo({
                position: PRESET_LOCATIONS.HAINAN.position,
                ...PRESET_LOCATIONS.HAINAN.camera,
                duration: 2,
            });
        }
    }, [camera]);

    const handleFlyTo = (
        location: (typeof PRESET_LOCATIONS)[keyof typeof PRESET_LOCATIONS]
    ) => {
        camera?.flyTo({
            position: location.position,
            ...location.camera,
            duration: 3,
        });
    };

    return (
        <div className='cesium-container'>
            <ControlPanel onFlyTo={handleFlyTo} />
            <div id='cesiumContainer' className='map-container' />
        </div>
    );
};

export default CesiumDemo;
