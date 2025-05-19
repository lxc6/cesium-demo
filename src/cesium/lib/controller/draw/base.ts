/**
 *  ---------------------------base.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    base的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/5/18
 *  @Param
 *  @Return
 *  @File           libs/utility/src/lib/cesium/controller/draw
 *  @Update         [time:user] 某用户更新此文件
 * */
import { Subject } from 'rxjs';
import { BaseCesiumScene } from '@/cesium';

export const CustomDataSourceToken = 'draw source';

export abstract class DrawBase<R> {
    dataSource = new Cesium.CustomDataSource(CustomDataSourceToken);

    position$ = new Subject();

    result$ = new Subject<R>();

    protected constructor(protected cesiumBase: BaseCesiumScene) {
        window.addEventListener('keydown', this.handleKeyDown.bind(this), {
            passive: true,
        });
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.code === 'Escape') this.destroy();
    }

    start() {
        this.cesiumBase.viewer.dataSources.add(this.dataSource);
        this.cesiumBase.settings.clickEvent.enable = false;
    }

    destroy() {
        this.position$.complete();
        this.cesiumBase.settings.clickEvent.enable = true;
        if (!this.result$.closed) this.result$.complete();
        this.cesiumBase.viewer.dataSources.remove(this.dataSource);
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    // abstract drawGraphics(): Entity;
}
