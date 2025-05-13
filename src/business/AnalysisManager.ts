import { CreateResult } from '../types';

/**
 * 分析管理器类
 * 用于管理和控制场景中的分析功能，如开挖分析等
 */
export class AnalysisManager {
    private viewer: Cesium.Viewer;
    private excavationRegions: Map<string, any> = new Map();

    constructor(viewer: Cesium.Viewer) {
        this.viewer = viewer;
    }

    /**
     * 添加开挖区域
     * @param name 区域名称
     * @param position 区域位置坐标数组
     * @param height 开挖深度
     * @param transparent 是否透明
     */
    addExcavationRegion({
        name,
        position,
        height,
        transparent = false,
    }: {
        name: string;
        position: number[];
        height: number;
        transparent?: boolean;
    }): CreateResult {
        try {
            if (height <= 0 || height >= 1000) {
                throw new Error('开挖深度应在0.1 ~ 999.9之间');
            }

            // 移除同名区域
            if (this.excavationRegions.has(name)) {
                this.removeExcavationRegion(name);
            }

            // 添加开挖区域
            const excavationRegion =
                this.viewer.scene.globe.addExcavationRegion({
                    name,
                    position,
                    height,
                    transparent,
                });

            if (!excavationRegion) {
                throw new Error('创建开挖区域失败');
            }

            this.excavationRegions.set(name, excavationRegion);
            return { successfully: true };
        } catch (error) {
            return {
                successfully: false,
                msg:
                    error instanceof Error ? error.message : '创建开挖区域失败',
            };
        }
    }

    /**
     * 移除指定开挖区域
     * @param name 区域名称
     */
    removeExcavationRegion(name: string): void {
        if (this.excavationRegions.has(name)) {
            this.viewer.scene.globe.removeExcavationRegion(
                this.excavationRegions.get(name)
            );
            this.excavationRegions.delete(name);
        }
    }

    /**
     * 移除所有开挖区域
     */
    removeAllExcavationRegions(): void {
        this.viewer.scene.globe.removeAllExcavationRegion();
        this.excavationRegions.clear();
    }

    /**
     * 销毁管理器
     */
    destroy(): void {
        this.removeAllExcavationRegions();
    }
}
