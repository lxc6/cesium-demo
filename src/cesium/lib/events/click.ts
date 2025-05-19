/**
 *  ---------------------------click.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    events的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/13
 *  @Param
 *  @Return
 *  @File           libs/feature/core/src/lib/cesium
 *  @Update         [time:user] 某用户更新此文件
 * */
import { Subject } from 'rxjs';
import { ClickEventSetting } from '../settings/click';

export interface ClickEventObs<T extends object> {
    position: typeof Cesium.Cartesian2;
    primitive: typeof Cesium.S3MTilesLayer | null;
    attr?: T;
}

/**
 * cesium 点击事件处理
 * @param viewer
 * @param clickSetting
 */
export function setupClickEvent(viewer: typeof Cesium.Viewer, clickSetting: ClickEventSetting) {
    const subject = new Subject<ClickEventObs<{ [key: string]: string }>>();

    viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(evt) {
        if (!clickSetting.enable) return;
        const { position } = evt;
        // 交点对象
        const pickedFeature = viewer.scene.pick(position);
        if (!Cesium.defined(pickedFeature)) {
            subject.next({ position, primitive: null });
            return;
        }
        // 当前点击后的primitive为点击的图层
        const { primitive } = pickedFeature;
        // 判断属性如果存在并且未开启， 则开启
        // if (layer.indexedDBSetting && !layer.indexedDBSetting.isAttributesSave)
        //   layer.indexedDBSetting.isAttributesSave = true; // 保存属性
        subject.next({ position, primitive });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return subject;
}
