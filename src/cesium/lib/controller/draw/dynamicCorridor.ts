import { ChainNodeExecutor } from '@/util';
import {
    BaseCesiumScene,
    cartesianToLatLng,
    createTooltip,
    DrawLine,
    MouseTooltip,
} from '@/cesium';
import { finalize, takeUntil } from 'rxjs';

// 传递给corridor的参数
export interface CorridorOption extends Record<string, unknown> {
    height?: number;
    width?: number;
    extrudedHeight?: number;
}

/**
 * 动态立体墙
 */
export class DynamicCorridor extends ChainNodeExecutor {
    draw: DrawLine;

    corridor;

    backup: () => void;

    tooltip: MouseTooltip;

    lastLngLat = { lng: 0, lat: 0, height: 0 };

    constructor(private cesiumBase: BaseCesiumScene) {
        super();
        this.tooltip = createTooltip(
            <HTMLDivElement>cesiumBase.viewer.container.firstElementChild
        );
        this.draw = new DrawLine(cesiumBase, { maxLength: 2 });
        this.backup = this.cesiumBase.toggleAlpha(0.1);
    }

    async doExecute(options?: CorridorOption) {
        this.draw.position$
            .pipe(
                takeUntil(this.draw.result$),
                finalize(() => {
                    this.tooltip.destroy();
                })
            )
            .subscribe((res) => {
                this.lastLngLat = cartesianToLatLng(res);
                const windowPosition =
                    Cesium.SceneTransforms.wgs84ToWindowCoordinates(
                        this.cesiumBase.viewer.scene,
                        res
                    );

                this.tooltip.showAt(
                    windowPosition,
                    '鼠标点击选择起点与终点，拖动选择位置,完成选择'
                );
            });
        const dynamicPositions = new Cesium.CallbackProperty(
            () => this.draw.positions,
            false
        );
        const dynamicHeight = new Cesium.CallbackProperty(
            () => this.lastLngLat.height - 20,
            false
        );
        const dynamicHeightTop = new Cesium.CallbackProperty(
            () => this.lastLngLat.height,
            false
        );

        const wait = this.draw.start();

        const corridor = {
            positions: dynamicPositions,
            height: dynamicHeight,
            width: 0.25,
            extrudedHeight: dynamicHeightTop,
            cornerType: Cesium.CornerType.MITERED,
            material: Cesium.Color.ORANGE.withAlpha(0.5),
            outline: true, // height required for outlines to display,
            ...options,
        };

        // 生成动态标绘走廊
        this.corridor = this.cesiumBase.viewer.entities.add({
            name: 'Green corridor at height with mitered corners and outline',
            corridor,
        });

        await wait;

        return [
            corridor.height > 0 ? corridor.extrudedHeight : 0 - corridor.height,
            this.draw.positions,
        ] as [number, (typeof Cesium.Cartesian3)[]];
    }

    override complete() {
        this.backup();
        this.cesiumBase.viewer.entities.remove(this.corridor);
    }

    reset(): void {
        this.cesiumBase.viewer.entities.remove(this.corridor);
    }

    destroy(): void {
        this.draw.destroy();
        this.cesiumBase.viewer.entities.remove(this.corridor);
        this.backup();
    }
}
