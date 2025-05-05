import { EventCallback, PickedFeature, CesiumEvent } from '../types/events';

/**
 * 事件系统类
 * 用于管理场景中的各种交互事件
 */
export class EventSystem {
    private handlers: Map<string, EventCallback[]> = new Map();
    private screenSpaceHandler: Cesium.ScreenSpaceEventHandler;
    private viewer: Cesium.Viewer;

    /**
     * 构造函数
     * @param viewer Cesium Viewer实例
     */
    constructor(viewer: Cesium.Viewer) {
        this.viewer = viewer;
        this.screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(
            viewer.scene.canvas
        );
        this.initEvents();
    }

    /**
     * 初始化事件监听
     * 设置点击和悬停事件的处理
     * @private
     */
    private initEvents(): void {
        // 点击事件
        this.screenSpaceHandler.setInputAction((event: CesiumEvent) => {
            if (event.position) {
                const picked = this.viewer.scene.pick(event.position);
                const position = this.viewer.scene.pickPosition(event.position);
                console.log('picked: ', picked);
                console.log('position: ', position);

                this.emit('click', {
                    id: picked?.id?.id,
                    primitive: picked?.primitive,
                    position,
                });
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 悬停事件
        this.screenSpaceHandler.setInputAction((event: CesiumEvent) => {
            if (event.endPosition) {
                const picked = this.viewer.scene.pick(event.endPosition);
                const position = this.viewer.scene.pickPosition(
                    event.endPosition
                );

                this.emit('hover', {
                    id: picked?.id?.id,
                    primitive: picked?.primitive,
                    position,
                });
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    /**
     * 注册事件监听器
     * @param event 事件名称
     * @param callback 回调函数
     */
    public on(event: string, callback: EventCallback): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)?.push(callback);
    }

    /**
     * 移除事件监听器
     * @param event 事件名称
     * @param callback 要移除的回调函数
     */
    public off(event: string, callback: EventCallback): void {
        const handlers = this.handlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(callback);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     * @param event 事件名称
     * @param data 事件数据
     * @private
     */
    private emit(event: string, data: PickedFeature): void {
        const handlers = this.handlers.get(event);
        if (handlers) {
            handlers.forEach((handler) => handler(data));
        }
    }

    /**
     * 销毁事件系统，清理资源
     */
    public destroy(): void {
        this.screenSpaceHandler.destroy();
        this.handlers.clear();
    }
}
