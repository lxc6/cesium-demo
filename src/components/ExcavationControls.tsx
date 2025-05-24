import React, { useState } from 'react';
import { Button, InputNumber } from 'antd';
import './ExcavationControls.scss';

interface ExcavationControlsProps {
    onStartExcavation: (depth: number) => void;
}

const ExcavationControls: React.FC<ExcavationControlsProps> = ({
    onStartExcavation,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [depth, setDepth] = useState<number>(10);
    const [isActive, setIsActive] = useState(false);

    const handleExcavationClick = (depth: number) => {
        setIsActive(!isActive);
        onStartExcavation(depth);
    };

    return (
        <div
            className={`excavation-controls ${isExpanded ? 'expanded' : 'collapsed'}`}
        >
            <div
                className='excavation-header'
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>挖方分析</span>
                <span className='toggle-icon'>{isExpanded ? '−' : '+'}</span>
            </div>
            {isExpanded && (
                <div className='excavation-content'>
                    <div className='input-group'>
                        <span>深度(米): </span>
                        <InputNumber
                            min={0.1}
                            max={999.9}
                            value={depth}
                            onChange={(value) => setDepth(value || 10)}
                        />
                    </div>
                    <Button
                        className={isActive ? 'active' : ''}
                        onClick={() => handleExcavationClick(depth)}
                    >
                        开始挖方分析
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ExcavationControls;
