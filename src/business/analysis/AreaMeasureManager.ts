import {
	Cartesian3,
	ScreenSpaceEventType,
	CallbackProperty,
	PolygonHierarchy,
	Color,
	Entity,
	Math as CesiumMath,
	Cartographic,
	Viewer,
	Cartesian2,
	LabelStyle,
	VerticalOrigin,
	HorizontalOrigin,
	HeightReference,
} from 'cesium';
import { BaseMeasureManager } from './BaseMeasureManager';
import { defaultMeasureStyles } from './measureUtils';
import { createDrawMessage } from '@/tools/message';

export class AreaMeasureManager extends BaseMeasureManager {
	private positions: Cartesian3[] = [];
	private tempPositions: Cartesian3[] = [];
	private tempEntity: Entity | null = null;
	private vertexEntities: Entity[] = [];
	private labelEntities: Entity[] = [];
	private polygonEntity: Entity | null = null;
	private areaLabelEntity: Entity | null = null;

	constructor(viewer: Viewer) {
		super(viewer, 'AREA');
		console.log('AreaMeasureManager 构造函数被调用');
	}

	protected initMeasureEvents(): void {
		if (!this.handler) {
			console.error('事件处理器未初始化');
			return;
		}

		console.log('初始化面积测量事件');
		// 显示绘制提示
		this.drawMessage = createDrawMessage();
		this.drawMessage.show('左键点击添加点，右键结束绘制，ESC取消进程');

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

		console.log('所有事件处理器已初始化完成');
	}

	private handleMouseMove = (movement: any) => {
		let position = this.viewer.scene.pickPosition(movement.endPosition);
		if (!position) {
			position = this.viewer.camera.pickEllipsoid(
				movement.endPosition,
				this.viewer.scene.globe.ellipsoid
			);
		}
		if (!position) return;

		if (this.positions.length === 0) {
			// 创建临时点，跟随鼠标
			if (!this.tempEntity) {
				this.tempEntity = this.viewer.entities.add(
					new Entity({
						position: position,
						point: {
							pixelSize: 8,
							color: Color.fromCssColorString('#00BFFF'),
							outlineColor: Color.WHITE,
							outlineWidth: 2,
							heightReference: HeightReference.CLAMP_TO_GROUND,
							disableDepthTestDistance: Number.POSITIVE_INFINITY,
						},
					})
				);
			} else {
				this.tempEntity.position = position;
			}
		} else if (this.positions.length >= 1) {
			this.updateTempPolygon(position);
		}
	};

	private handleLeftClick = (movement: any) => {
		let position = this.viewer.scene.pickPosition(movement.position);
		if (!position) {
			position = this.viewer.camera.pickEllipsoid(
				movement.position,
				this.viewer.scene.globe.ellipsoid
			);
		}
		if (!position) return;

		console.log('添加顶点:', this.positions.length + 1);

		if (this.positions.length === 0) {
			// 第一个点
			this.positions.push(position);
			this.createVertexEntity(position, this.positions.length - 1);

			// 移除临时点
			if (this.tempEntity) {
				this.viewer.entities.remove(this.tempEntity);
				this.tempEntity = null;
			}

			// 创建临时多边形
			this.createTempPolygon();
			console.log('创建了第一个顶点和临时多边形');
		} else {
			// 添加新顶点
			this.positions.push(position);
			this.createVertexEntity(position, this.positions.length - 1);
			console.log('添加了顶点:', this.positions.length);
		}
	};

	private handleRightClick = () => {
		if (this.positions.length >= 3) {
			this.completeMeasure();
		} else {
			this.destroy();
		}
	};

	private createTempPolygon() {
		console.log('创建临时多边形和边线');

		const getHierarchy = () => {
			const positions = [...this.positions];
			return new PolygonHierarchy(positions);
		};

		const getPositions = () => {
			const positions = [...this.positions];
			if (positions.length >= 3) {
				positions.push(positions[0]); // 闭合线条
			}
			return positions;
		};

		// 创建临时多边形（填充区域）
		this.tempEntity = this.viewer.entities.add(
			new Entity({
				polygon: {
					hierarchy: new CallbackProperty(getHierarchy, false),
					material: Color.fromCssColorString(
						defaultMeasureStyles.polygon.material
					).withAlpha(0.3),
					outline: false,
					heightReference: HeightReference.CLAMP_TO_GROUND,
				},
				polyline: {
					positions: new CallbackProperty(getPositions, false),
					width: 3,
					material: Color.fromCssColorString(
						defaultMeasureStyles.polygon.outlineColor
					),
					clampToGround: true,
				},
			})
		);

		console.log('临时多边形和边线创建完成');
	}

	private updateTempPolygon(position: Cartesian3) {
		if (!this.tempEntity) return;

		const getHierarchy = () => {
			const positions = [...this.positions, position];
			return new PolygonHierarchy(positions);
		};

		const getPositions = () => {
			const positions = [...this.positions, position];
			if (positions.length >= 3) {
				positions.push(positions[0]); // 闭合线条
			}
			return positions;
		};

		// 更新多边形
		if (this.tempEntity.polygon) {
			this.tempEntity.polygon.hierarchy = new CallbackProperty(
				getHierarchy,
				false
			);
		}

		// 更新边线
		if (this.tempEntity.polyline) {
			this.tempEntity.polyline.positions = new CallbackProperty(
				getPositions,
				false
			);
		}

		// 更新实时面积标签
		if (this.positions.length >= 2) {
			this.updateAreaLabel(position);
		}
	}

	private createVertexEntity(position: Cartesian3, index: number) {
		console.log('创建顶点实体:', index + 1);

		const vertexEntity = this.viewer.entities.add(
			new Entity({
				position: position,
				point: {
					pixelSize: 8,
					color: Color.fromCssColorString(
						defaultMeasureStyles.point.color
					),
					outlineColor: Color.fromCssColorString(
						defaultMeasureStyles.point.outlineColor
					),
					outlineWidth: defaultMeasureStyles.point.outlineWidth,
					heightReference: HeightReference.CLAMP_TO_GROUND,
					disableDepthTestDistance: Number.POSITIVE_INFINITY,
				},
				label: {
					text: `${index + 1}`,
					font: '14px sans-serif',
					fillColor: Color.WHITE,
					style: LabelStyle.FILL_AND_OUTLINE,
					outlineColor: Color.WHITE,
					outlineWidth: 2,
					verticalOrigin: VerticalOrigin.BOTTOM,
					horizontalOrigin: HorizontalOrigin.CENTER,
					pixelOffset: new Cartesian2(0, -25),
					showBackground: true,
					backgroundColor: Color.fromCssColorString(
						defaultMeasureStyles.point.color
					).withAlpha(0.8),
					backgroundPadding: new Cartesian2(4, 4),
					disableDepthTestDistance: Number.POSITIVE_INFINITY,
				},
			})
		);

		this.vertexEntities.push(vertexEntity);
		this.addEntityToManager(vertexEntity);
		console.log('顶点实体创建完成:', index + 1);
	}

	private updateAreaLabel(position: Cartesian3): void {
		const tempPositions = [...this.positions, position];

		// 计算面积和周长
		const area = this.calculateArea(tempPositions);
		const perimeter = this.calculatePerimeter(tempPositions);

		const areaText =
			area > 1000000
				? `面积: ${(area / 1000000).toFixed(2)} km²`
				: `面积: ${area.toFixed(2)} m²`;
		const perimeterText = `周长: ${perimeter.toFixed(2)} m`;

		if (!this.areaLabelEntity) {
			this.areaLabelEntity = this.viewer.entities.add(
				new Entity({
					position: position,
					label: {
						text: areaText,
						font: '16px sans-serif',
						fillColor: Color.WHITE,
						style: LabelStyle.FILL_AND_OUTLINE,
						outlineColor: Color.WHITE,
						outlineWidth: 2,
						verticalOrigin: VerticalOrigin.BOTTOM,
						horizontalOrigin: HorizontalOrigin.LEFT,
						pixelOffset: new Cartesian2(15, -15),
						showBackground: true,
						backgroundColor: Color.fromCssColorString(
							defaultMeasureStyles.polygon.material
						).withAlpha(0.8),
						// backgroundColor:
						// 	Color.fromCssColorString('#00BFFF').withAlpha(0.8),
						backgroundPadding: new Cartesian2(8, 4),
						disableDepthTestDistance: Number.POSITIVE_INFINITY,
					},
				})
			);
			this.addEntityToManager(this.areaLabelEntity);
		} else {
			this.areaLabelEntity.position = position;
			if (this.areaLabelEntity.label) {
				this.areaLabelEntity.label.text = areaText;
			}
		}
	}

	private calculateArea(positions: Cartesian3[]): number {
		console.log('计算面积');
		if (positions.length < 3) return 0;

		// 使用投影坐标系计算平面多边形面积
		let area = 0;
		const projectedPositions = positions.map((position) => {
			// 转换为经纬度坐标
			const cartographic = Cartographic.fromCartesian(position);
			const lon = CesiumMath.toDegrees(cartographic.longitude);
			const lat = CesiumMath.toDegrees(cartographic.latitude);

			// 使用简单的投影转换（墨卡托投影的简化版本）
			const x = lon * 111319.9 * Math.cos(CesiumMath.toRadians(lat));
			const y = lat * 111319.9;
			return { x, y };
		});

		// 使用多边形面积计算公式（鞋带公式）
		for (let i = 0; i < projectedPositions.length; i++) {
			const j = (i + 1) % projectedPositions.length;
			area += projectedPositions[i].x * projectedPositions[j].y;
			area -= projectedPositions[j].x * projectedPositions[i].y;
		}

		console.log('面积计算完成:', Math.abs(area / 2));
		return Math.abs(area / 2);
	}

	private calculatePerimeter(positions: Cartesian3[]): number {
		console.log('计算周长');
		let perimeter = 0;
		for (let i = 0; i < positions.length; i++) {
			const nextIndex = (i + 1) % positions.length;
			perimeter += Cartesian3.distance(
				positions[i],
				positions[nextIndex]
			);
		}
		console.log('周长计算完成:', perimeter);
		return perimeter;
	}

	private completeMeasure(): void {
		if (this.positions.length < 3) return;

		try {
			console.log('完成面积测量，顶点数量:', this.positions.length);

			// 计算最终面积和周长
			const area = this.calculateArea(this.positions);
			const perimeter = this.calculatePerimeter(this.positions);

			// 清理临时实体
			if (this.tempEntity) {
				this.viewer.entities.remove(this.tempEntity);
				this.tempEntity = null;
			}

			// 创建最终的多边形实体
			const finalPolygon = this.viewer.entities.add(
				new Entity({
					polygon: {
						hierarchy: new PolygonHierarchy(this.positions),
						material: Color.fromCssColorString(
							defaultMeasureStyles.polygon.material
						).withAlpha(0.4),
						outline: false,
						heightReference: HeightReference.CLAMP_TO_GROUND,
					},
					polyline: {
						positions: [...this.positions, this.positions[0]], // 闭合线条
						width: 0,
						material: Color.fromCssColorString(
							defaultMeasureStyles.polygon.outlineColor
						),
						clampToGround: true,
					},
				})
			);
			this.addEntityToManager(finalPolygon);

			// 创建最终的面积标签（在多边形中心）
			const center = this.calculatePolygonCenter(this.positions);
			const areaText =
				area > 1000000
					? `面积: ${(area / 1000000).toFixed(2)} km²`
					: `面积: ${area.toFixed(2)} m²`;
			const perimeterText = `周长: ${perimeter.toFixed(2)} m`;

			const finalAreaLabel = this.viewer.entities.add(
				new Entity({
					position: center,
					label: {
						text: areaText,
						font: '16px sans-serif',
						fillColor: Color.WHITE,
						style: LabelStyle.FILL_AND_OUTLINE,
						outlineColor: Color.WHITE,
						outlineWidth: 2,
						verticalOrigin: VerticalOrigin.CENTER,
						horizontalOrigin: HorizontalOrigin.CENTER,
						showBackground: true,
						backgroundColor: Color.fromCssColorString(
							defaultMeasureStyles.polygon.material
						).withAlpha(0.8),
						// Color.fromCssColorString('#00BFFF').withAlpha(0.9),
						backgroundPadding: new Cartesian2(10, 6),
						disableDepthTestDistance: Number.POSITIVE_INFINITY,
					},
				})
			);
			this.addEntityToManager(finalAreaLabel);

			// 移除临时面积标签
			if (this.areaLabelEntity) {
				this.viewer.entities.remove(this.areaLabelEntity);
				this.areaLabelEntity = null;
			}

			// 显示测量结果弹窗
			const measureResult = {
				vertexCount: this.positions.length,
				perimeter: `${perimeter.toFixed(2)} m`,
				area:
					area > 1000000
						? `${(area / 1000000).toFixed(2)} km²`
						: `${area.toFixed(2)} m²`,
			};
			this.showMeasureResult(measureResult);

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

			console.log('面积测量完成');
		} catch (error) {
			console.error('完成测量时出错:', error);
			this.destroy();
		}
	}

	// 计算多边形中心点
	private calculatePolygonCenter(positions: Cartesian3[]): Cartesian3 {
		let x = 0,
			y = 0,
			z = 0;
		for (const position of positions) {
			x += position.x;
			y += position.y;
			z += position.z;
		}
		return new Cartesian3(
			x / positions.length,
			y / positions.length,
			z / positions.length
		);
	}

	public destroy(): void {
		super.destroy();
		this.positions = [];
		this.tempPositions = [];
		this.measuring = false;

		// 清理所有实体
		[
			this.tempEntity,
			this.polygonEntity,
			this.areaLabelEntity,
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
		this.polygonEntity = null;
		this.areaLabelEntity = null;
		this.vertexEntities = [];
		this.labelEntities = [];
	}
}
