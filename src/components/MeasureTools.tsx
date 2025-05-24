import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { MeasureType } from '@/business/analysis/types';
import { useMeasureStore } from '@/store/measureStore';
import './MeasureTools.scss';

interface MeasureToolsProps {
	viewer: any;
}

export const MeasureTools: React.FC<MeasureToolsProps> = ({ viewer }) => {
	const { setViewer, startMeasure, stopMeasure } = useMeasureStore();
	const [isExpanded, setIsExpanded] = useState(true);
	const [activeMode, setActiveMode] = useState<MeasureType | null>(null);

	// 初始化 viewer 和清理函数
	useEffect(() => {
		if (viewer) {
			setViewer(viewer);
		}
		return () => {
			stopMeasure();
		};
	}, [viewer, setViewer, stopMeasure]);

	const handleMeasureClick = async (type: MeasureType) => {
		try {
			setActiveMode(type);
			await startMeasure(type);
		} catch (error) {
			console.error('启动测量失败:', error);
		}
	};

	return (
		<div
			className={`measure-tools ${isExpanded ? 'expanded' : 'collapsed'}`}
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
