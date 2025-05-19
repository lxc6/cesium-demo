import { CesiumPopup } from '../controller/popup/popup';
import { FeatureController, GetFeatureMode } from '../fetch';
import { overturn } from '../tools';

export class ClickEventSetting {
    // 点击事件处理器列表 如果处理器返回true则表示命中，后续无需处理
    handler = new Map<string, (primitive, position) => boolean>();

    // 是否启用？
    enable = true;

    // 点击显示属性弹窗？
    attrBox = true;

    featureController?: FeatureController;

    // 上次点击的对象标识
    lastClickID: string | undefined;

    component?: (layer: any) => string | HTMLElement;

    componentTag?: (layer: any) => string | HTMLElement;

    html: (layer) => Promise<string> = async layer => {
        if (this.featureController) this.featureController.cancel();
        this.featureController = new FeatureController();
        const data = await this.featureController.query({
            ids: layer.getSelection(),
            datasetNames: [overturn(layer.name)],
            getFeatureMode: GetFeatureMode.ID
        });

        if (!data || data.totalCount <= 0) return '没有查询到属性';

        const { attribute } = data.features[0];

        return `<div class='default-content max-h-80'><h3>属性详情</h3>${CesiumPopup.createAttrListHtml(
            attribute
        )}</div>`;
    };

    attachEventHandler(id: string, handler: (primitive, position) => boolean) {
        this.handler.set(id, handler);
    }

    removeEventHandler(id: string) {
        this.handler.delete(id);
    }
}
