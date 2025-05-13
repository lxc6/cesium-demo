import React, { useState } from 'react';
import { Button } from 'antd';
import { DrawMode } from '@/business/DrawManager';
import './DrawControls.scss';

interface DrawControlsProps {
    onStartDraw: (mode: DrawMode) => void;
}

const DrawControls: React.FC<DrawControlsProps> = ({ onStartDraw }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeMode, setActiveMode] = useState<DrawMode | null>(null);

    const handleDrawClick = (mode: DrawMode) => {
        setActiveMode(mode);
        onStartDraw(mode);
    };

    return (
        <div
            className={`draw-controls ${isExpanded ? 'expanded' : 'collapsed'}`}
        >
            <div
                className='draw-header'
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>绘制工具</span>
                <span className='toggle-icon'>{isExpanded ? '−' : '+'}</span>
            </div>
            {isExpanded && (
                <div className='draw-content'>
                    <div className='draw-buttons'>
                        <Button
                            className={
                                activeMode === DrawMode.Point ? 'active' : ''
                            }
                            onClick={() => handleDrawClick(DrawMode.Point)}
                        >
                            点
                        </Button>
                        <Button
                            className={
                                activeMode === DrawMode.Line ? 'active' : ''
                            }
                            onClick={() => handleDrawClick(DrawMode.Line)}
                        >
                            线
                        </Button>
                        <Button
                            className={
                                activeMode === DrawMode.Polygon ? 'active' : ''
                            }
                            onClick={() => handleDrawClick(DrawMode.Polygon)}
                        >
                            面
                        </Button>
                        <Button
                            className={
                                activeMode === DrawMode.Rectangle
                                    ? 'active'
                                    : ''
                            }
                            onClick={() => handleDrawClick(DrawMode.Rectangle)}
                        >
                            矩形
                        </Button>
                        <Button
                            className={
                                activeMode === DrawMode.Circle ? 'active' : ''
                            }
                            onClick={() => handleDrawClick(DrawMode.Circle)}
                        >
                            圆形
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrawControls;
