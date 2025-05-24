import React from 'react';
import { SegmentInfo } from './MeasureInfoPopupManager';
import DraggableDialog from './DraggableDialog';
import './MeasureInfoPopup.scss';

interface MeasureInfoPopupProps {
	measureInfo: SegmentInfo[];
	onClose?: () => void;
	measureType: 'LINE' | 'AREA' | 'SURFACE';
	parentClassName?: string;
	getContainer?: HTMLElement | (() => HTMLElement) | false;
}

interface InfoItem {
	key: string;
	value: string | number;
}

const MeasureInfoPopup: React.FC<MeasureInfoPopupProps> = ({
	measureInfo,
	onClose,
	measureType,
	parentClassName = 'map-container',
	getContainer,
}) => {
	const getInfoItems = (info: SegmentInfo): InfoItem[] => {
		switch (measureType) {
			case 'LINE':
				return [
					{ key: '起点坐标', value: info.startPoint || '-' },
					{ key: '终点坐标', value: info.endPoint || '-' },
					{ key: '空间距离', value: info.distance || '-' },
					{ key: '垂直距离', value: info.verticalDistance || '-' },
					{
						key: '水平距离 X',
						value: info.horizontalDistanceX || '-',
					},
					{
						key: '水平距离 Y',
						value: info.horizontalDistanceY || '-',
					},
				];
			case 'AREA':
				return [
					{ key: '顶点个数', value: info.vertexCount || 0 },
					{
						key: '周长',
						value: info.perimeter || '-',
					},
					{ key: '面积', value: info.area || '-' },
				];
			case 'SURFACE':
				return [
					{ key: '设备位号', value: info.deviceId || '-' },
					{
						key: '表面积',
						value: info.surfaceArea
							? `${info.surfaceArea} m²`
							: '-',
					},
				];
			default:
				return [];
		}
	};

	const getMeasureTitle = () => {
		switch (measureType) {
			case 'LINE':
				return '线段测量结果';
			case 'AREA':
				return '面积测量结果';
			case 'SURFACE':
				return '表面积测量结果';
			default:
				return '测量结果';
		}
	};

	return (
		<DraggableDialog
			className='measure-info-popup'
			onClose={onClose}
			title={getMeasureTitle()}
			parentClassName={parentClassName}
			getContainer={getContainer}
		>
			<div className='measure-info-content'>
				{measureInfo.map((info, index) => (
					<div key={index} className='segment-info'>
						{info.segmentName && <h4>{info.segmentName}</h4>}
						<div className='info-items'>
							{getInfoItems(info).map((item, itemIndex) => (
								<div
									key={itemIndex}
									className={`info-item ${
										itemIndex % 2 === 0 ? 'odd' : 'even'
									}`}
								>
									<span className='info-key'>{item.key}</span>
									<span className='info-value'>
										{item.value}
									</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</DraggableDialog>
	);
};

export default MeasureInfoPopup;
