import React, { useState } from 'react';
import { Button } from 'antd';
import { MeasureType } from '@/business/analysis/types';
import './MeasureControls.scss';

interface MeasureControlsProps {
	onStartMeasure: (type: MeasureType) => void;
}

const MeasureControls: React.FC<MeasureControlsProps> = ({
	onStartMeasure,
}) => {
	const [isExpanded, setIsExpanded] = useState(true);
	const [activeMode, setActiveMode] = useState<MeasureType | null>(null);

	const handleMeasureClick = (type: MeasureType) => {
		setActiveMode(type);
		onStartMeasure(type);
	};

	return (
		<div
			className={`measure-controls ${
				isExpanded ? 'expanded' : 'collapsed'
			}`}
		>
			<div
				className='measure-header'
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<span>测量工具</span>
				<span className='toggle-icon'>{isExpanded ? '−' : '+'}</span>
			</div>
			{isExpanded && (
				<div className='measure-content'>
					<div className='measure-buttons'>
						<Button
							className={activeMode === 'LINE' ? 'active' : ''}
							onClick={() => handleMeasureClick('LINE')}
						>
							线段测量
						</Button>
						<Button
							className={activeMode === 'AREA' ? 'active' : ''}
							onClick={() => handleMeasureClick('AREA')}
						>
							面积测量
						</Button>
						<Button
							className={activeMode === 'SURFACE' ? 'active' : ''}
							onClick={() => handleMeasureClick('SURFACE')}
						>
							表面积测量
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default MeasureControls;
