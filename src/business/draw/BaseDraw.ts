import * as Cesium from 'cesium';

import {
    createDrawMessage,
    DrawMessage,
    screenCoordinatesToDegrees,
} from '../../tools/index';
import { DrawMode, DrawResult } from '../DrawManager';

/**
 * 基础绘制类，所有绘制类型的父类
 */
export abstract class BaseDraw {
    protected viewer: Cesium.Viewer;
    protected handler: Cesium.ScreenSpaceEventHandler;
    protected positions: Cesium.Cartesian3[] = [];
    protected tempEntity: Cesium.Entity | null = null;
    protected message: DrawMessage;
    protected moveStatus = false;

    constructor(viewer: Cesium.Viewer) {
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(
            this.viewer.scene.canvas
        );
        this.message = createDrawMessage();
    }

    /**
     * 开始绘制
     * @returns Promise<DrawResult> 绘制结果
     */
    abstract start(): Promise<DrawResult>;

    /**
     * 停止绘制
     */
    stop(): void {
        this.positions = [];
        this.clearTempEntity();
        this.removeEventHandlers();
        this.message.hide();
    }

    /**
     * 从屏幕坐标获取世界坐标
     */
    protected getCartesianFromScreenPoint(
        screenPoint: Cesium.Cartesian2
    ): Cesium.Cartesian3 | undefined {
        const { cartesian } = screenCoordinatesToDegrees(
            this.viewer,
            screenPoint
        );
        return cartesian;
    }

    /**
     * 清除临时实体
     */
    protected clearTempEntity(): void {
        if (this.tempEntity) {
            this.viewer.entities.remove(this.tempEntity);
            this.tempEntity = null;
        }
    }

    /**
     * 移除事件处理器
     */
    protected removeEventHandlers(): void {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 销毁
     */
    destroy(): void {
        this.stop();
        this.handler.destroy();
    }
}
