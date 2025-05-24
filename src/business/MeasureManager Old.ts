import { createDrawMessage } from '@/tools/message';
import { popupManager } from '@/components/popup';

export enum MeasureMode {
	LINE = 'LINE',
	AREA = 'AREA',
	SURFACE = 'SURFACE',
}

/**
 * 测量管理器类，用于处理地图上的距离、面积和表面积测量功能
 */
export class MeasureManager {
	/** Cesium视图对象 */
	private viewer: Cesium.Viewer;
	/** 测量点位数组 */
	private positions: any[] = [];
	/** 事件处理器 */
	private handler: any = null;
	/** 当前活动实体（线或面） */
	private activeEntity: any = null;
	/** 测量结果标签实体 */
	private labelEntity: any = null;
	/** 绘制提示消息对象 */
	private drawMessage: any = null;
	/** 顶点实体数组 */
	private vertexEntities: any[] = [];
	/** 顶点标签实体数组 */
	private vertexLabelEntities: any[] = [];
	/** 线段信息数组 */
	private segmentInfos: any[] = [];
	/** 当前测量模式 */
	private measureMode: MeasureMode = MeasureMode.LINE;
	/** 面积测量边线实体 */
	private outlineEntity: any = null;

	/**
	 * 构造函数
	 * @param viewer Cesium视图对象
	 */
	constructor(viewer: Cesium.Viewer) {
		this.viewer = viewer;
		this.drawMessage = createDrawMessage();
	}

	/**
	 * 开始测量
	 * @param mode 测量模式（线段距离、面积、表面积）
	 */
	startMeasure(mode: MeasureMode) {
		this.reset();
		// 设置当前测量模式
		this.measureMode = mode;
		// 清除地图背景以提高显示效果
		this.viewer.scene.globe.enableLighting = false;
		this.viewer.scene.globe.showGroundAtmosphere = false;
		this.viewer.scene.fog.enabled = false;
		this.viewer.scene.skyAtmosphere!.show = false;

		this.initHandler(mode);
		let message = '';
		switch (mode) {
			case MeasureMode.LINE:
				message =
					'当前为线段测量模式，左键单击绘制首个顶点，单击鼠标右键结束绘制！';
				break;
			case MeasureMode.AREA:
				message =
					'当前为面积测量模式，左键单击绘制首个顶点，单击鼠标右键结束绘制！';
				break;
			case MeasureMode.SURFACE:
				message = '任意选择一个设备，测量其表面积！';
				break;
		}
		this.drawMessage.show(message);
	}

	/**
	 * 将屏幕坐标转换为世界坐标
	 * @param screenPoint 屏幕坐标点
	 * @returns 世界坐标点或undefined
	 */
	private getCartesianFromScreenPoint(
		screenPoint: Cesium.Cartesian2
	): Cesium.Cartesian3 | undefined {
		const ray = this.viewer.camera.getPickRay(screenPoint);
		if (!ray) return undefined;

		const cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
		if (!cartesian) {
			// 如果没有拾取到地形，则使用椭球体表面的点
			const ellipsoid = this.viewer.scene.globe.ellipsoid;
			return this.viewer.camera.pickEllipsoid(screenPoint, ellipsoid);
		}
		return cartesian;
	}

	/**
	 * 初始化事件处理器
	 * @param mode 测量模式
	 */
	private initHandler(mode: MeasureMode) {
		// 添加ESC键监听
		const keyboardEventHandler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				this.reset();
				document.removeEventListener('keydown', keyboardEventHandler);
			}
		};
		document.addEventListener('keydown', keyboardEventHandler);
		this.handler = new Cesium.ScreenSpaceEventHandler(
			this.viewer.scene.canvas
		);

		if (mode === MeasureMode.SURFACE) {
			// 表面积测量模式下只需要左键点击事件
			this.handler.setInputAction((event: any) => {
				const pickedObject = this.viewer.scene.pick(event.position);
				console.log('pickedObject', pickedObject);

				if (Cesium.defined(pickedObject) && pickedObject.id) {
					const entity = pickedObject.id;
					console.log('entity', entity);

					if (entity.polygon) {
						const positions =
							entity.polygon.hierarchy.getValue().positions;
						const surfaceArea =
							this.calculateSurfaceArea(positions);
						this.updateMeasurement(mode, positions);
						console.log('surfaceArea', surfaceArea);
					}
				}
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		} else {
			// 其他测量模式的事件处理
			// 左键点击添加点
			this.handler.setInputAction((event: any) => {
				const cartesian = this.getCartesianFromScreenPoint(
					event.position
				);
				if (!cartesian) return;

				this.positions.push(cartesian);
				this.updateDrawing(mode);
				this.updateMeasurement(mode);
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

			// 右键完成绘制
			this.handler.setInputAction(() => {
				if (
					this.positions.length >= (mode === MeasureMode.LINE ? 2 : 3)
				) {
					this.complete();
					this.drawMessage.hide();
				}
			}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

			// 鼠标移动时实时更新
			this.handler.setInputAction((event: any) => {
				const cartesian = this.getCartesianFromScreenPoint(
					event.endPosition
				);
				if (!cartesian && this.positions.length < 1) return;

				const tempPositions = [...this.positions];
				if (cartesian) {
					tempPositions.push(cartesian);
				}
				this.updateDrawing(mode, tempPositions);
				this.updateMeasurement(mode, tempPositions);
			}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		}
	}

	/**
	 * 更新绘制图形
	 * @param mode 测量模式
	 * @param positions 点位数组
	 */
	private updateDrawing(
		mode: MeasureMode,
		positions: any[] = this.positions
	) {
		// 在表面积测量模式下不需要创建实体
		if (mode === MeasureMode.SURFACE) return;

		// 清除现有实体
		if (this.activeEntity) {
			this.viewer.entities.remove(this.activeEntity);
		}
		this.vertexEntities.forEach((entity) => {
			this.viewer.entities.remove(entity);
		});
		this.vertexEntities = [];
		this.vertexLabelEntities.forEach((entity) => {
			this.viewer.entities.remove(entity);
		});
		this.vertexLabelEntities = [];

		if (positions.length < 1) return;

		// 创建顶点实体
		positions.forEach((position, index) => {
			// 添加顶点点
			const vertexEntity = this.viewer.entities.add({
				position,
				point: {
					pixelSize: 8,
					color: Cesium.Color.fromCssColorString('#3974F6'),
					outlineColor: Cesium.Color.WHITE,
					outlineWidth: 2,
					disableDepthTestDistance: Number.POSITIVE_INFINITY,
				},
			});
			this.vertexEntities.push(vertexEntity);

			// 添加顶点标签 - 只在线段测量模式下添加
			let distanceText = '';
			if (index === 0) {
				distanceText = '起点';
			}
			if (
				mode === MeasureMode.LINE &&
				index > 0 &&
				positions.length > 1
			) {
				const prevPosition = positions[index - 1];
				const distance = Cesium.Cartesian3.distance(
					prevPosition,
					position
				);

				if (distance > 1000) {
					distanceText = `区间长度：${(distance / 1000).toFixed(
						2
					)} km`;
				} else {
					distanceText = `区间长度：${distance.toFixed(2)} m`;
				}

				// 如果是最后一个点，添加总距离
				if (index === positions.length - 1) {
					// 如果有多个点，添加总距离
					if (positions.length >= 2) {
						const totalDistance = this.calculateDistance(positions);
						let totalDistanceText = '';
						if (totalDistance > 1000) {
							totalDistanceText = `总长: ${(
								totalDistance / 1000
							).toFixed(2)} km`;
						} else {
							totalDistanceText = `总长: ${totalDistance.toFixed(
								2
							)} m`;
						}
						distanceText = `${distanceText}\n ${totalDistanceText}`;
					}
				}

				const labelEntity = this.viewer.entities.add({
					position: position,
					label: {
						text: distanceText,
						font: '14px Microsoft YaHei',
						fillColor: Cesium.Color.WHITE,
						outlineColor: Cesium.Color.fromCssColorString(
							'rgba(255,255,255,0)'
						),
						outlineWidth: 2,
						style: Cesium.LabelStyle.FILL_AND_OUTLINE,
						verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
						horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
						pixelOffset: new Cesium.Cartesian2(0, -10),
						showBackground: true,
						backgroundColor:
							Cesium.Color.fromCssColorString(
								'#3974F6'
							).withAlpha(0.7),
						backgroundPadding: new Cesium.Cartesian2(7, 5),
						disableDepthTestDistance: Number.POSITIVE_INFINITY,
					},
				});
				this.vertexLabelEntities.push(labelEntity);
			}
		});

		// 根据测量模式创建不同的实体
		if (mode === MeasureMode.LINE) {
			// 创建线实体
			this.activeEntity = this.viewer.entities.add({
				polyline: {
					positions,
					width: 3,
					material: new Cesium.PolylineDashMaterialProperty({
						color: Cesium.Color.fromCssColorString('#3974F6'),
					}),
					clampToGround: false,
					depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
						color: Cesium.Color.fromCssColorString('#3974F6'),
					}),
				},
			});
		} else if (mode === MeasureMode.AREA) {
			// 创建面实体
			this.activeEntity = this.viewer.entities.add({
				polygon: {
					hierarchy: positions,
					material:
						Cesium.Color.fromCssColorString('#3974F6').withAlpha(
							0.5
						),
					outline: true,
					outlineColor: Cesium.Color.fromCssColorString('#3974F6'),
					outlineWidth: 2,
				},
			});

			// 面积测量时，添加边线实体
			if (!this.outlineEntity) {
				this.outlineEntity = this.viewer.entities.add({
					polyline: {
						positions: [...positions, positions[0]], // 闭合边线
						width: 2,
						material: Cesium.Color.fromCssColorString('#3974F6'),
						clampToGround: false,
					},
				});
			} else {
				// 更新边线位置
				this.outlineEntity.polyline.positions =
					new Cesium.ConstantProperty([...positions, positions[0]]);
			}
		}
	}

	/**
	 * 更新测量结果
	 * @param mode 测量模式
	 * @param positions 点位数组
	 */
	private updateMeasurement(
		mode: MeasureMode,
		positions: any[] = this.positions
	) {
		if (positions.length < (mode === MeasureMode.LINE ? 2 : 3)) return;

		if (this.labelEntity) {
			this.viewer.entities.remove(this.labelEntity);
			this.labelEntity = null;
		}

		let measurement = 0;
		let label = '';
		let unit = '';

		if (mode === MeasureMode.LINE) {
			measurement = this.calculateDistance(positions);
			if (measurement > 1000) {
				measurement = measurement / 1000;
				unit = 'km';
			} else {
				unit = 'm';
			}
			// 线段测量不在这里显示总长度标签，而是在顶点标签中显示
			// label = `距离: ${measurement.toFixed(2)} ${unit}`;
			return; // 线段测量不需要在终点显示总长度标签
		} else if (mode === MeasureMode.AREA) {
			measurement = this.calculateArea(positions);
			if (measurement > 1000000) {
				measurement = measurement / 1000000;
				unit = 'km²';
			} else {
				unit = 'm²';
			}
			label = `面积: ${measurement.toFixed(2)} ${unit}`;

			// 更新边线
			if (this.outlineEntity) {
				this.outlineEntity.polyline.positions =
					new Cesium.ConstantProperty([...positions, positions[0]]);
			}
		} else if (mode === MeasureMode.SURFACE) {
			measurement = this.calculateSurfaceArea(positions);
			if (measurement > 1000000) {
				measurement = measurement / 1000000;
				unit = 'km²';
			} else {
				unit = 'm²';
			}
			label = `表面积: ${measurement.toFixed(2)} ${unit}`;
		}

		const lastPosition = positions[positions.length - 1];
		this.labelEntity = this.viewer.entities.add({
			position: lastPosition,
			label: {
				text: label,
				font: '16px Microsoft YaHei',
				fillColor: Cesium.Color.WHITE,
				outlineColor: Cesium.Color.fromCssColorString(
					'rgba(255,255,255,0)'
				), // 文字边框色,
				outlineWidth: 2,
				style: Cesium.LabelStyle.FILL_AND_OUTLINE,
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
				pixelOffset: new Cesium.Cartesian2(10, -10),
				showBackground: true,
				backgroundColor:
					Cesium.Color.fromCssColorString('#3974F6').withAlpha(0.9),
				backgroundPadding: new Cesium.Cartesian2(10, 10),
				disableDepthTestDistance: Number.POSITIVE_INFINITY,
			},
		});
	}

	/**
	 * 计算距离
	 * @param positions 点位数组
	 * @returns 距离值（米）
	 */
	private calculateDistance(positions: any[]): number {
		let distance = 0;
		for (let i = 0; i < positions.length - 1; i++) {
			distance += Cesium.Cartesian3.distance(
				positions[i],
				positions[i + 1]
			);
		}
		return distance;
	}

	/**
	 * 计算平面多边形面积
	 * @param positions 点位数组
	 * @returns 面积值（平方米）
	 */
	private calculateArea(positions: any[]): number {
		if (positions.length < 3) return 0;

		// 使用投影坐标系计算平面多边形面积
		let area = 0;
		const projectedPositions = positions.map((position) => {
			// 转换为经纬度坐标
			const cartographic = Cesium.Cartographic.fromCartesian(position);
			const lon = Cesium.Math.toDegrees(cartographic.longitude);
			const lat = Cesium.Math.toDegrees(cartographic.latitude);

			// 使用简单的投影转换（墨卡托投影的简化版本）
			const x = lon * 111319.9 * Math.cos(Cesium.Math.toRadians(lat));
			const y = lat * 111319.9;
			return { x, y };
		});

		// 使用多边形面积计算公式（鞋带公式）
		for (let i = 0; i < projectedPositions.length; i++) {
			const j = (i + 1) % projectedPositions.length;
			area += projectedPositions[i].x * projectedPositions[j].y;
			area -= projectedPositions[j].x * projectedPositions[i].y;
		}

		return Math.abs(area / 2);
	}

	/**
	 * 计算表面积
	 * @param positions 点位数组
	 * @returns 表面积值（平方米）
	 */
	private calculateSurfaceArea(positions: any[]): number {
		// 使用三角剖分计算表面积
		let surfaceArea = 0;
		for (let i = 0; i < positions.length - 2; i++) {
			const p1 = positions[i];
			const p2 = positions[i + 1];
			const p3 = positions[i + 2];

			// 计算三角形面积
			const v1 = Cesium.Cartesian3.subtract(
				p2,
				p1,
				new Cesium.Cartesian3()
			);
			const v2 = Cesium.Cartesian3.subtract(
				p3,
				p1,
				new Cesium.Cartesian3()
			);
			const cross = Cesium.Cartesian3.cross(
				v1,
				v2,
				new Cesium.Cartesian3()
			);
			const area = Cesium.Cartesian3.magnitude(cross) / 2;

			surfaceArea += area;
		}
		return surfaceArea;
	}

	/**
	 * 完成测量
	 */
	private complete() {
		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}

		// 如果是面积测量，清除边线
		if (this.outlineEntity && this.measureMode === MeasureMode.AREA) {
			this.viewer.entities.remove(this.outlineEntity);
			this.outlineEntity = null;
		}

		// 计算并显示线段详细信息
		if (this.positions.length >= 2) {
			this.segmentInfos = [];
			for (let i = 0; i < this.positions.length - 1; i++) {
				const startPoint = this.positions[i];
				const endPoint = this.positions[i + 1];

				// 计算起始点的地理坐标
				const startCartographic =
					Cesium.Cartographic.fromCartesian(startPoint);
				const startLon = Cesium.Math.toDegrees(
					startCartographic.longitude
				);
				const startLat = Cesium.Math.toDegrees(
					startCartographic.latitude
				);
				const startHeight = startCartographic.height;

				// 计算终止点的地理坐标
				const endCartographic =
					Cesium.Cartographic.fromCartesian(endPoint);
				const endLon = Cesium.Math.toDegrees(endCartographic.longitude);
				const endLat = Cesium.Math.toDegrees(endCartographic.latitude);
				const endHeight = endCartographic.height;

				// 计算距离
				const distance = Cesium.Cartesian3.distance(
					startPoint,
					endPoint
				);
				const verticalDistance = Math.abs(endHeight - startHeight);
				const horizontalDistanceX =
					Math.abs(endLon - startLon) *
					111319.9 *
					Math.cos(Cesium.Math.toRadians((startLat + endLat) / 2));
				const horizontalDistanceY =
					Math.abs(endLat - startLat) * 111319.9;

				this.segmentInfos.push({
					segmentName: `线段${i + 1}`,
					startPoint: `${startLon.toFixed(6)}, ${startLat.toFixed(
						6
					)}`,
					endPoint: `${endLon.toFixed(6)}, ${endLat.toFixed(6)}`,
					distance: `${distance.toFixed(2)} m`,
					verticalDistance: `${verticalDistance.toFixed(2)} m`,
					horizontalDistanceX: `${horizontalDistanceX.toFixed(2)} m`,
					horizontalDistanceY: `${horizontalDistanceY.toFixed(2)} m`,
				});
			}

			// 使用新的弹窗管理器显示测量信息
			popupManager.showMeasureInfo(this.segmentInfos, this.measureMode);
		}

		// 保存positions数组的副本，以便在reset()中使用
		const savedPositions = [...this.positions];
		this.positions = [];

		// 如果测量完成后没有显示弹窗，在这里确保显示
		if (this.segmentInfos.length > 0) {
			popupManager.showMeasureInfo(this.segmentInfos, this.measureMode);
		}
	}

	/**
	 * 重置测量状态
	 */
	reset() {
		// 如果没有测量信息，则先计算测量结果
		if (this.segmentInfos.length === 0 && this.positions.length >= 2) {
			this.complete();
		}

		if (this.activeEntity) {
			this.viewer.entities.remove(this.activeEntity);
			this.activeEntity = null;
		}
		if (this.labelEntity) {
			this.viewer.entities.remove(this.labelEntity);
			this.labelEntity = null;
		}
		// 清理边线实体
		if (this.outlineEntity) {
			this.viewer.entities.remove(this.outlineEntity);
			this.outlineEntity = null;
		}
		// 清理顶点实体和标签
		this.vertexEntities.forEach((entity) => {
			this.viewer.entities.remove(entity);
		});
		this.vertexEntities = [];
		this.vertexLabelEntities.forEach((entity) => {
			this.viewer.entities.remove(entity);
		});
		this.vertexLabelEntities = [];

		// 如果有测量结果，显示弹窗后再清空数据
		if (this.segmentInfos.length > 0) {
			popupManager.showMeasureInfo(this.segmentInfos, this.measureMode);
			// 延迟清空segmentInfos，确保弹窗有足够时间显示
			setTimeout(() => {
				this.segmentInfos = [];
			}, 100);
		} else {
			this.segmentInfos = [];
		}

		// 恢复地图背景设置
		this.viewer.scene.globe.enableLighting = true;
		this.viewer.scene.globe.showGroundAtmosphere = true;
		this.viewer.scene.fog.enabled = true;
		this.viewer.scene.skyAtmosphere.show = true;

		// 隐藏提示信息
		if (this.drawMessage) {
			this.drawMessage.hide();
		}
	}

	/**
	 * 销毁测量管理器
	 */
	destroy() {
		this.reset();
		if (this.drawMessage) {
			this.drawMessage.destroy();
			this.drawMessage = null;
		}
		// 关闭所有弹窗
		popupManager.closeAll();
	}
}
