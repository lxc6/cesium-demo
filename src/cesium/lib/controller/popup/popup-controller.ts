import { CesiumPopup, PopupOptions } from './popup';

export class PopupController {
    popupMap = new Map<string, CesiumPopup>();

    private excludeTypeOnClose: string[] = [];

    constructor(private viewer: typeof Cesium.Viewer) {}

    reset() {
        this.popupMap.clear();
        this.excludeTypeOnClose.length = 0;
    }

    addExcludeType(type: string) {
        this.excludeTypeOnClose.push(type);
        return () => this.removeExcludeType(type);
    }

    removeExcludeType(type: string) {
        this.excludeTypeOnClose = this.excludeTypeOnClose.filter(t => t !== type);
    }

    //获取或者创建一个新的实例
    getOrCreatePopup(id: string, options?: Partial<PopupOptions>): CesiumPopup {
        if (this.popupMap.has(id)) return this.popupMap.get(id) as CesiumPopup;
        const popupRef = new CesiumPopup(this.popupMap, {
            id,
            viewer: this.viewer,
            pixelOffset: new Cesium.Cartesian2(-5, 0),
            translucencyByDistance: new Cesium.NearFarScalar(0, 1, 10000, 0.5),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 11000),
            ...options
        });

        this.popupMap.set(id, popupRef);
        return popupRef;
    }

    closeByType(type: string) {
        this.popupMap.forEach(pr => {
            if (pr.type === type) pr.destroy();
        });
    }

    closeById(id: string) {
        this.popupMap.get(id)?.destroy();
    }

    closeAll() {
        this.popupMap.forEach(pr => {
            if (!pr.type || !this.excludeTypeOnClose.includes(String(pr.type))) pr.destroy();
        });
    }
}
