import { useState, useEffect } from 'react';
import { useCesiumStore } from '@/store/cesium';
import { Switch, Slider, Button } from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import './LayerControls.scss';

const LayerControls: React.FC = () => {
    const { coreCesium, setIsReady } = useCesiumStore();
    const [isExpanded, setIsExpanded] = useState(true);
    const [showPipeline, setShowPipeline] = useState(true);
    const [showDevice, setShowDevice] = useState(true);
    const [opacity, setOpacity] = useState(100);

    const handleResetView = () => {
        if (coreCesium?.viewer) {
            coreCesium.cameraManager.resetView();
        }
    };

    const handlePipelineChange = (checked: boolean) => {
        setShowPipeline(checked);
        if (coreCesium?.viewer) {
            const pipelineLayer =
                coreCesium.viewer.scene.layers.layerQueue.filter((p: any) => {
                    console.log('p.name', p.name);
                    return p.name.includes('pipeline_layer');
                });
            console.log('pipelineLayer', pipelineLayer);
            if (pipelineLayer && pipelineLayer.length) {
                pipelineLayer.map((itm: any) => {
                    console.log('itm', itm);
                    itm.visible = checked;
                });
            }
        }
    };

    const handleDeviceChange = (checked: boolean) => {
        setShowDevice(checked);
        if (coreCesium?.viewer) {
            const deviceLayer =
                coreCesium.viewer.scene.layers.layerQueue.filter((p: any) =>
                    p.name.includes('device_layer')
                );
            console.log('deviceLayer', deviceLayer);
            if (deviceLayer && deviceLayer.length) {
                deviceLayer.map((itm: any) => {
                    console.log('itm', itm);
                    itm.visible = checked;
                });
            }
        }
    };

    const handleOpacityChange = (value: number) => {
        setOpacity(value);
        if (coreCesium?.viewer) {
            const layers = coreCesium.viewer.scene.layers.layerQueue;
            layers.forEach((layer: any) => {
                if (
                    layer.name.includes('pipeline_layer') ||
                    layer.name.includes('device_layer')
                ) {
                    layer.style3D.fillForeColor.alpha = value / 100;
                }
            });
        }
    };

    return (
        <div
            className={`layer-controls ${
                isExpanded ? 'expanded' : 'collapsed'
            }`}
        >
            <div
                className='layer-header'
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>图层控制</span>
                <span className='toggle-icon'>{isExpanded ? '−' : '+'}</span>
            </div>
            {isExpanded && (
                <div className='layer-content'>
                    <div className='layer-item'>
                        <span>管线图层</span>
                        <Switch
                            checked={showPipeline}
                            onChange={handlePipelineChange}
                        />
                    </div>
                    <div className='layer-item'>
                        <span>设备图层</span>
                        <Switch
                            checked={showDevice}
                            onChange={handleDeviceChange}
                        />
                    </div>
                    <div className='layer-item'>
                        <span>复位视角</span>
                        <Button
                            // type='text'
                            icon={<UndoOutlined />}
                            onClick={handleResetView}
                            style={{ padding: '4px 8px' }}
                        />
                    </div>
                    <div className='opacity-control'>
                        <span>透明度</span>
                        <div className='slider-container'>
                            <Slider
                                value={opacity}
                                onChange={handleOpacityChange}
                                min={0}
                                max={100}
                            />
                            <span>{opacity}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LayerControls;
