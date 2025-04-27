/**
 * 实体管理器类
 * 用于管理场景中的实体对象（点、线、面等）
 */
import { EntityOptions } from '../types/entity';

export class EntityManager {
	private entities: Map<string, Cesium.Entity> = new Map();
	private viewer: Cesium.Viewer;

	/**
	 * 构造函数
	 * @param viewer Cesium Viewer实例
	 */
	constructor(viewer: Cesium.Viewer) {
		this.viewer = viewer;
	}

	/**
	 * 添加实体到场景
	 * @param options 实体选项
	 * @param options.id 实体唯一标识
	 * @param options.position 实体位置(Cartesian3)
	 * @param options.point 点样式配置
	 * @param options.point.pixelSize 点大小(像素)
	 * @param options.point.color 点颜色
	 * @param options.label 标签配置
	 * @param options.label.text 标签文本
	 * @param options.label.font 字体样式
	 * @param options.label.fillColor 填充颜色
	 * @returns 创建的实体对象
	 */
	public add(options: EntityOptions): Cesium.Entity {
		const { position, ...entityOptions } = options;
		
		const entity = new Cesium.Entity({
			...entityOptions,
			position: Cesium.Cartesian3.fromDegrees(
				position.longitude,
				position.latitude,
				position.height
			),
		});

		this.viewer.entities.add(entity);
		this.entities.set(options.id, entity);

		return entity;
	}

	/**
	 * 从场景中移除指定实体
	 * @param id 实体ID
	 */
	public remove(id: string): void {
		const entity = this.entities.get(id);
		if (entity) {
			this.viewer.entities.remove(entity);
			this.entities.delete(id);
		}
	}

	/**
	 * 根据ID获取实体
	 * @param id 实体ID
	 * @returns 实体对象或undefined
	 */
	public getById(id: string): Cesium.Entity | undefined {
		return this.entities.get(id);
	}

	/**
	 * 销毁所有实体并清理资源
	 */
	public destroy(): void {
		this.entities.forEach((entity) => {
			this.viewer.entities.remove(entity);
		});
		this.entities.clear();
	}
}
