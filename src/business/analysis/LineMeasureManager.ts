import {
	Cartesian3,
	ScreenSpaceEventType,
	CallbackProperty,
	PolylineGraphics,
	Cartographic,
	Math as CesiumMath,
	Color,
	Entity,
	Property,
	Viewer,
	Cartesian2,
	LabelStyle,
	VerticalOrigin,
	HorizontalOrigin,
} from 'cesium';
import { BaseMeasureManager } from './BaseMeasureManager';
import { LineMeasureInfo } from './types';
import { defaultMeasureStyles } from './measureUtils';
import { createDrawMessage } from '@/tools/message';

// 定义事件类型
interface MouseMoveEvent {
	startPosition: Cartesian2;
	endPosition: Cartesian2;
}

interface MouseClickEvent {
	position: Cartesian2;
}

interface SegmentInfo {
	segmentName: string;
	startPoint: string;
	endPoint: string;
	distance: string;
	verticalDistance: string;
	horizontalDistanceX: string;
	horizontalDistanceY: string;
}

export class LineMeasureManager extends BaseMeasureManager {
	private positions: Cartesian3[] = [];
	private tempPositions: Cartesian3[] = [];
	private tempEntity: Entity | null = null;
	private vertexEntities: Entity[] = [];
	private labelEntities: Entity[] = [];
	private polylineEntity: Entity | null = null;
	private rightClickCurrent: boolean = false;

	constructor(viewer: Viewer) {
		super(viewer, 'LINE');
	}

	protected initMeasureEvents(): void {
		if (!this.handler) {
			console.error('LineMeasureManager: 事件处理器未初始化');
			return;
		}
		// 显示绘制提示
		this.drawMessage = createDrawMessage();
		this.drawMessage.show('左键点击添加点，右键完成绘制，ESC取消进程');

		// 鼠标移动事件
		this.handler.setInputAction(
			this.handleMouseMove.bind(this),
			ScreenSpaceEventType.MOUSE_MOVE
		);

		// 左键点击事件
		this.handler.setInputAction(
			this.handleLeftClick.bind(this),
			ScreenSpaceEventType.LEFT_CLICK
		);

		// 右键点击事件
		this.handler.setInputAction(
			this.handleRightClick.bind(this),
			ScreenSpaceEventType.RIGHT_CLICK
		);
	}

	private handleLeftClick(movement: MouseClickEvent) {
		this.rightClickCurrent = false;
		let position = this.viewer.scene.pickPosition(movement.position);

		// 如果 pickPosition 失败，尝试使用 pickEllipsoid
		if (!position) {
			console.log(
				'LineMeasureManager: pickPosition 失败，尝试 pickEllipsoid'
			);
			position = this.viewer.camera.pickEllipsoid(
				movement.position,
				this.viewer.scene.globe.ellipsoid
			);
		}

		if (!position) {
			console.log('LineMeasureManager: 未能获取有效的点击位置');
			return;
		}
		this.positions.push(position);

		// 创建顶点实体和标签
		this.createVertexEntity(position, this.positions.length - 1);

		this.updateTempLine();
		this.drawMessage?.show('继续点击添加点，右键结束绘制，ESC取消进程');
	}

	private handleRightClick(): void {
		if (this.positions.length >= 2) {
			this.rightClickCurrent = true;

			// 更新最后一个点的标签内容
			const lastLabelEntity =
				this.labelEntities[this.labelEntities.length - 1];
			if (lastLabelEntity && lastLabelEntity.label) {
				const lastPosition = this.positions[this.positions.length - 1];
				lastLabelEntity.label.text = this.createLabelText(
					lastPosition,
					this.positions.length - 1,
					false
				);
			}

			// 如果已经有两个点以上，完成测量
			this.completeMeasure();
		} else {
			// 否则取消测量
			this.destroy();
		}
	}

	private handleMouseMove(movement: MouseMoveEvent) {
		console.log('LineMeasureManager: handleMouseMove 被触发');
		let position = this.viewer.scene.pickPosition(movement.endPosition);

		// 如果 pickPosition 失败，尝试使用 pickEllipsoid
		if (!position) {
			console.log(
				'LineMeasureManager: pickPosition 失败，尝试 pickEllipsoid'
			);
			position = this.viewer.camera.pickEllipsoid(
				movement.endPosition,
				this.viewer.scene.globe.ellipsoid
			);
		}

		if (!position) {
			console.log('LineMeasureManager: 未能获取有效的移动位置');
			return;
		}

		// 创建或更新临时点和标签
		if (!this.tempEntity) {
			this.tempEntity = this.viewer.entities.add(
				new Entity({
					position: position,
					point: {
						pixelSize: 8,
						color: Color.fromCssColorString('#3974F6'),
						outlineColor: Color.WHITE,
						outlineWidth: 2,
						disableDepthTestDistance: Number.POSITIVE_INFINITY,
					},
					label: {
						text:
							this.positions.length === 0
								? ''
								: this.createLabelText(
										position,
										this.positions.length,
										true
								  ),
						font: '14px Microsoft YaHei',
						fillColor: Color.WHITE,
						style: LabelStyle.FILL,
						verticalOrigin: VerticalOrigin.BOTTOM,
						horizontalOrigin: HorizontalOrigin.LEFT,
						pixelOffset: new Cartesian2(10, -10),
						showBackground: true,
						backgroundColor:
							Color.fromCssColorString('#3974F6').withAlpha(0.7),
						disableDepthTestDistance: Number.POSITIVE_INFINITY,
					},
				})
			);
		} else {
			// 更新临时点的位置
			this.tempEntity.position = position;

			// 更新临时标签的文本
			if (this.positions.length > 0 && this.tempEntity.label) {
				this.tempEntity.label.text = this.createLabelText(
					position,
					this.positions.length,
					true
				);
			}
		}

		// 如果已经有点了，就更新临时线和所有标签
		if (this.positions.length > 0) {
			this.updateTempLine(position);
		}
	}

	private updateTempLine(tempPosition?: Cartesian3) {
		if (!tempPosition || this.positions.length === 0) return;

		const positions = [...this.positions, tempPosition];

		const polylineOptions = {
			...defaultMeasureStyles.line,
			positions: new CallbackProperty(() => {
				return positions;
			}, false) as Property,
			material: Color.fromCssColorString(
				defaultMeasureStyles.line.material
			),
		};

		if (!this.tempEntity) {
			const entity = new Entity({
				polyline: new PolylineGraphics(polylineOptions),
			});
			this.tempEntity = this.viewer.entities.add(entity);
		} else {
			this.tempEntity.polyline = new PolylineGraphics(polylineOptions);
		}

		// 更新所有已有点的标签
		this.labelEntities.forEach((entity, index) => {
			if (entity && entity.label) {
				const labelText = this.createLabelText(
					this.positions[index],
					index,
					false
				);
				entity.label.text = labelText;
			}
		});
	}

	private createVertexEntity(position: Cartesian3, index: number): void {
		// 创建顶点
		const vertexEntity = this.viewer.entities.add({
			id: `vertex_${index}`,
			position: position,
			point: {
				pixelSize: 8,
				color: Color.fromCssColorString('#3974F6'),
				outlineColor: Color.WHITE,
				outlineWidth: 2,
				disableDepthTestDistance: Number.POSITIVE_INFINITY,
			},
		});
		this.vertexEntities.push(vertexEntity);
		this.addEntityToManager(vertexEntity);

		// 创建标签
		const labelText = this.createLabelText(position, index);
		const labelEntity = this.viewer.entities.add({
			id: `label_${index}`,
			position: position,
			label: {
				text: labelText,
				font: '14px Microsoft YaHei',
				fillColor: Color.WHITE,
				style: LabelStyle.FILL,
				verticalOrigin: VerticalOrigin.BOTTOM,
				horizontalOrigin: HorizontalOrigin.LEFT,
				pixelOffset: new Cartesian2(10, -10),
				showBackground: true,
				backgroundColor:
					Color.fromCssColorString('#3974F6').withAlpha(0.7),
				disableDepthTestDistance: Number.POSITIVE_INFINITY,
			},
		});
		this.labelEntities.push(labelEntity);
		this.addEntityToManager(labelEntity);
	}

	private createLabelText(
		position: Cartesian3,
		index: number,
		isTemp: boolean = false
	): string {
		let labelText = '';

		// 起点显示
		if (index === 0) {
			labelText = '起点';
			return labelText;
		}

		// 计算与前一个点的距离
		const prevPosition = this.positions[index - 1];
		const distance = Cartesian3.distance(prevPosition, position);

		// 区间距离显示
		if (distance > 1000) {
			labelText = `区间: ${(distance / 1000).toFixed(2)} km`;
		} else {
			labelText = `区间: ${distance.toFixed(2)} m`;
		}

		// 如果是临时点（鼠标移动点）或者是最后一个点且右键结束了测量，显示总长度
		if (
			isTemp ||
			(index === this.positions.length - 1 && this.rightClickCurrent)
		) {
			const totalDistance =
				this.calculateTotalDistance() + (isTemp ? distance : 0);
			if (totalDistance > 1000) {
				labelText += `\n总长: ${(totalDistance / 1000).toFixed(2)} km`;
			} else {
				labelText += `\n总长: ${totalDistance.toFixed(2)} m`;
			}
		}

		return labelText;
	}

	private calculateTotalDistance(): number {
		let totalDistance = 0;
		for (let i = 0; i < this.positions.length - 1; i++) {
			totalDistance += Cartesian3.distance(
				this.positions[i],
				this.positions[i + 1]
			);
		}
		return totalDistance;
	}

	// private clearAllEntities() {
	// 	// 清理所有实体
	// 	this.vertexEntities.forEach((entity) => {
	// 		if (entity && this.viewer.entities.contains(entity)) {
	// 			this.viewer.entities.remove(entity);
	// 		}
	// 	});
	// 	this.vertexEntities = [];

	// 	// 清理临时实体
	// 	if (this.tempEntity && this.viewer.entities.contains(this.tempEntity)) {
	// 		this.viewer.entities.remove(this.tempEntity);
	// 		this.tempEntity = null;
	// 	}

	// 	// 清理标签实体
	// 	this.labelEntities.forEach((entity) => {
	// 		if (entity && this.viewer.entities.contains(entity)) {
	// 			this.viewer.entities.remove(entity);
	// 		}
	// 	});
	// 	this.labelEntities = [];

	// 	// 重置状态
	// 	this.positions = [];
	// 	this.measuring = false;
	// }

	private completeMeasure(): void {
		if (this.positions.length < 2) return;
		try {
			// 计算线段信息
			const segments = this.calculateSegments();
			console.log('线段数据:', segments);

			// 显示测量结果弹窗
			this.showMeasureResult(segments);

			// 清理临时实体
			if (this.tempEntity) {
				this.viewer.entities.remove(this.tempEntity);
				this.tempEntity = null;
			}

			// 创建最终实体
			const entityId = this.generateEntityId();
			const entity = new Entity({
				id: entityId,
				polyline: {
					positions: this.positions,
					width: 2,
					material: Color.fromCssColorString('#3974F6'),
					clampToGround: true,
				},
			});
			const finalEntity = this.viewer.entities.add(entity);
			this.addEntityToManager(finalEntity);

			// 保留顶点和标签实体
			this.vertexEntities.forEach((entity) => {
				if (entity) {
					this.addEntityToManager(entity);
				}
			});
			this.labelEntities.forEach((entity) => {
				if (entity) {
					this.addEntityToManager(entity);
				}
			});

			// 停止测量
			this.measuring = false;

			// 清理事件处理器
			if (this.handler) {
				this.handler.destroy();
				this.handler = null;
			}

			// 清理提示信息
			if (this.drawMessage) {
				this.drawMessage.destroy();
				this.drawMessage = null;
			}
		} catch (error) {
			console.error('完成测量时出错:', error);
			this.destroy();
		}
	}

	private calculateSegments() {
		const segments = [];
		for (let i = 0; i < this.positions.length - 1; i++) {
			const startPoint = this.positions[i];
			const endPoint = this.positions[i + 1];

			// 计算起始点的地理坐标
			const startCartographic = Cartographic.fromCartesian(startPoint);
			const startLon = CesiumMath.toDegrees(startCartographic.longitude);
			const startLat = CesiumMath.toDegrees(startCartographic.latitude);

			// 计算终止点的地理坐标
			const endCartographic = Cartographic.fromCartesian(endPoint);
			const endLon = CesiumMath.toDegrees(endCartographic.longitude);
			const endLat = CesiumMath.toDegrees(endCartographic.latitude);

			// 计算距离
			const distance = Cartesian3.distance(startPoint, endPoint);
			const verticalDistance = Math.abs(
				endCartographic.height - startCartographic.height
			);
			const horizontalDistanceX =
				Math.abs(endLon - startLon) *
				111319.9 *
				Math.cos(CesiumMath.toRadians((startLat + endLat) / 2));
			const horizontalDistanceY = Math.abs(endLat - startLat) * 111319.9;

			segments.push({
				segmentName: `线段${i + 1}`,
				startPoint: `${startLon.toFixed(6)}, ${startLat.toFixed(6)}`,
				endPoint: `${endLon.toFixed(6)}, ${endLat.toFixed(6)}`,
				distance: `${distance.toFixed(2)} m`,
				verticalDistance: `${verticalDistance.toFixed(2)} m`,
				horizontalDistanceX: `${horizontalDistanceX.toFixed(2)} m`,
				horizontalDistanceY: `${horizontalDistanceY.toFixed(2)} m`,
			});
		}
		return segments;
	}

	public destroy(): void {
		super.destroy();
		this.positions = [];
		this.tempPositions = [];
		this.measuring = false;
		this.rightClickCurrent = false;
		// 清理所有实体
		[
			this.tempEntity,
			this.polylineEntity,
			...this.vertexEntities,
			...this.labelEntities,
		]
			.filter(Boolean)
			.forEach((entity) => {
				if (entity && this.viewer.entities.contains(entity)) {
					this.viewer.entities.remove(entity);
				}
			});

		this.tempEntity = null;
		this.polylineEntity = null;
		this.vertexEntities = [];
		this.labelEntities = [];
	}
}
