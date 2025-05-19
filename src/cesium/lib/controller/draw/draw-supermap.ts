/**
 *  ---------------------------draw-supermap.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    draw的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/17
 *  @Param
 *  @Return
 *  @File           libs/feature/core/src/lib/cesium/tools
 *  @Update         [time:user] 某用户更新此文件
 * */
import { ChainNodeExecutor } from '@/util';
import { ClampMode, createTooltip, MouseTooltip } from '../../tools';
import { BaseCesiumScene } from '../../baseCesiumScene';

export enum DrawMode {
    Point,
    Line,
    Polygon,
    Marker,
    Box,
}

/**
 * 视图绘制基本类
 */
export class DrawSupermap extends ChainNodeExecutor {
    handlerPolygon?: typeof Cesium.DrawHandler;

    tooltip: MouseTooltip;

    constructor(private BCS: BaseCesiumScene) {
        super();
        this.tooltip = createTooltip(
            <HTMLDivElement>BCS.viewer.container.firstElementChild
        );
        if (!BCS.viewer.scene.pickPositionSupported) {
            throw new Error(
                '不支持深度纹理,无法绘制多边形，地形开挖功能无法使用！'
            );
        }
    }

    async doExecute(
        type = DrawMode.Polygon,
        moveTip?: (handlerPolygon) => string
    ): Promise<any> {
        this.BCS.settings.clickEvent.enable = false;
        // 多边形绘制(绘制处理器对象类, 支持栅格化面对象的绘制, viewer对象, 绘制模式, 绘制风格)
        this.handlerPolygon = new Cesium.DrawHandler(
            this.BCS.viewer,
            type,
            ClampMode.Space
        );
        // 关闭图元的深度检测
        this.handlerPolygon.enableDepthTest = false;

        let lastPosition;
        // 监听鼠标移动（movingEvt）： 绘制handler 移动事件
        this.handlerPolygon.movingEvt.addEventListener((windowPosition) => {
            // console.log(this.handlerPolygon);
            if (moveTip)
                this.tooltip.showAt(
                    windowPosition,
                    moveTip(this.handlerPolygon)
                );
            lastPosition = windowPosition;
        });

        //  drawEvt: 绘制完成事件，获取当前结果
        return new Promise((resolve) => {
            this.handlerPolygon.activate();
            this.handlerPolygon.drawEvt.addEventListener(
                (result: {
                    object: any;
                    positions: (typeof Cesium.Cartesian3)[];
                }) => {
                    console.log(result, 'resultresultresult');
                    this.tooltip.setVisible(false);
                    this.tooltip.message = '';
                    if (
                        type === DrawMode.Line &&
                        result.object.positions.length < 2
                    ) {
                        this.tooltip.showAt(lastPosition, '请绘制正确的线');
                        this.handlerPolygon?.clear();
                        this.handlerPolygon?.activate();
                        return;
                    }
                    resolve([result.object]);
                    this.BCS.settings.clickEvent.enable = true;
                }
            );
        });
    }

    reset() {
        this.tooltip?.setVisible(false);
        this.handlerPolygon.clear();
        this.handlerPolygon.deactivate();
    }

    destroy() {
        this.tooltip?.destroy();
        this.tooltip = undefined as any;
        this.handlerPolygon.clear();
        this.handlerPolygon.deactivate();
        this.handlerPolygon = undefined;
        this.BCS.settings.clickEvent.enable = true;
    }
}
