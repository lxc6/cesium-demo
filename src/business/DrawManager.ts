import * as Cesium from 'cesium';

import { createTooltip, MouseTooltip, createDrawMessage } from '../tools/index';

import {
    BaseDraw,
    PointDraw,
    LineDraw,
    PolygonDraw,
    RectangleDraw,
    CircleDraw,
    DrawStyle,
    defaultDrawStyle,
} from './draw';

export enum DrawMode {
    Point = 'Point',
    Line = 'Line',
    Polygon = 'Polygon',
    Rectangle = 'Rectangle',
    Circle = 'Circle',
}

export interface DrawResult {
    entity: Cesium.Entity;
    positions: Cesium.Cartesian3[];
    mode: DrawMode;
}

export type DrawCompleteCallback = (result: DrawResult) => void;

/**
 * 绘制管理器
 * 使用策略模式管理不同类型的绘制操作
 */
export class DrawManager {
    private viewer: Cesium.Viewer;
    private currentDraw: BaseDraw | null = null;
    private drawCompleteCallback: DrawCompleteCallback | null = null;
    private tooltip: MouseTooltip;
    private entities: Cesium.Entity[] = [];
    private style: DrawStyle;
    private drawMessage = createDrawMessage();

    constructor(viewer: Cesium.Viewer, style: Partial<DrawStyle> = {}) {
        this.viewer = viewer;
        this.style = { ...defaultDrawStyle, ...style };
        this.tooltip = createTooltip(
            this.viewer.container.firstElementChild as HTMLDivElement
        );
        this.setupKeyboardEventHandlers();
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    /**
     * 开始绘制
     * @param mode 绘制模式
     * @param callback 绘制完成回调
     */
    startDraw(mode: DrawMode, callback?: DrawCompleteCallback): void {
        // 停止当前绘制
        this.stopDraw();

        // 保存回调
        this.drawCompleteCallback = callback || null;

        // 创建对应的绘制类实例
        this.currentDraw = this.createDrawInstance(mode);

        // 开始绘制
        if (this.currentDraw) {
            this.currentDraw.start().then(this.handleDrawComplete.bind(this));
            this.drawMessage.show('按ESC键取消绘制', 'default');
        }
    }

    /**
     * 停止绘制
     */
    stopDraw(): void {
        if (this.currentDraw) {
            this.currentDraw.stop();
            this.currentDraw = null;
            this.drawMessage.hide('default');
        }
        this.tooltip.setVisible(false);
    }

    /**
     * 创建绘制实例
     */
    private createDrawInstance(mode: DrawMode): BaseDraw {
        switch (mode) {
            case DrawMode.Point:
                return new PointDraw(this.viewer, this.style);
            case DrawMode.Line:
                return new LineDraw(this.viewer, this.style);
            case DrawMode.Polygon:
                return new PolygonDraw(this.viewer, this.style);
            case DrawMode.Rectangle:
                return new RectangleDraw(this.viewer, this.style);
            case DrawMode.Circle:
                return new CircleDraw(this.viewer, this.style);
            default:
                throw new Error(`不支持的绘制模式: ${mode}`);
        }
    }

    /**
     * 处理绘制完成
     */
    private handleDrawComplete(result: DrawResult): void {
        // 保存实体
        if (result.entity) {
            this.entities.push(result.entity);
        }

        // 调用回调
        if (this.drawCompleteCallback) {
            this.drawCompleteCallback(result);
        }

        // 重置当前绘制
        this.currentDraw = null;

        // // 显示初始提示
        // const canvas = this.viewer.scene.canvas;
        // const rect = canvas.getBoundingClientRect();
        // const center = {
        //     x: rect.left + rect.width / 2,
        //     y: rect.top + rect.height / 2,
        // };
        // this.tooltip.showAt(center, '<p>请单击鼠标左键开始绘制</p>');
    }

    /**
     * 清除所有实体
     */
    clearAllEntities(): void {
        this.entities.forEach((entity) => {
            this.viewer.entities.remove(entity);
        });
        this.entities = [];
    }

    /**
     * 设置键盘事件处理器
     */
    private setupKeyboardEventHandlers(): void {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && this.currentDraw) {
                this.stopDraw();
                this.clearAllEntities();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        this._handleKeyDown = handleKeyDown;
    }

    private _handleKeyDown: ((event: KeyboardEvent) => void) | null = null;

    /**
     * 销毁管理器
     */
    destroy(): void {
        this.stopDraw();
        if (this._handleKeyDown) {
            document.removeEventListener('keydown', this._handleKeyDown);
        }
        this.tooltip.destroy();
        this.clearAllEntities();
    }
}
