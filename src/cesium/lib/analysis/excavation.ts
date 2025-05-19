/**
 *  ---------------------------excavation.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    excavation的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/17
 *  @Param
 *  @Return
 *  @File           libs/feature/core/src/lib/cesium/analysis
 *  @Update         [time:user] 某用户更新此文件
 * */

import { ChainNodeExecutor } from '@/util';
import { BaseCesiumScene } from '../baseCesiumScene';

/**
 * cesium 超图挖方分析
 */
export class Excavation extends ChainNodeExecutor {
    static extractingCoordinatesFromEntity(entity) {
        // 拷贝
        const array = [].concat(entity.positions);
        const positions: number[] = [];
        for (let i = 0, len = array.length; i < len; i++) {
            const cartographic = Cesium.Cartographic.fromCartesian(array[i]);
            const longitude = Cesium.Math.toDegrees(cartographic.longitude);
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);
            const h = cartographic.height;
            if (
                positions.indexOf(longitude) === -1 &&
                positions.indexOf(latitude) === -1
            ) {
                positions.push(longitude);
                positions.push(latitude);
                positions.push(h);
            }
        }
        return positions;
    }

    constructor(private BCS: BaseCesiumScene) {
        super();
    }

    async doExecute(position: number[], depth: number) {
        if (!this.BCS.viewer.scene.pickPositionSupported) {
            alert('不支持深度纹理,无法绘制多边形，地形开挖功能无法使用！');
        }
        if (depth <= 0 || depth >= 1000) {
            throw new Error('请选择合适的深度，深度应在0.1 ~ 999.9之间');
        }
        // 移除之前的结果
        this.BCS.viewer.scene.globe.removeAllExcavationRegion();

        if (
            !this.BCS.viewer.scene.globe.addExcavationRegion({
                name: '地形开挖',
                position,
                height: depth,
                transparent: false,
            })
        )
            throw new Error('创建地形失败');

        return [position, depth];
    }

    override complete() {
        this.reset();
    }

    reset() {
        this.BCS.viewer.scene.globe.removeAllExcavationRegion();
    }

    destroy() {
        this.BCS.viewer.scene.globe.removeAllExcavationRegion();
    }
}
