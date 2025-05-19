import { IconInstance } from './instance';
import { BehaviorSubject } from 'rxjs';
import { combineIconAndLabel } from './custom-label-img';
import { ThreeDimensionalContextService } from '../../view';

export class LabelsController {
    static Instance = new LabelsController();

    static settings = {
        labelSize: 30,
        fontSize: 16,
        labelHeight: 26,
        fontFamily: 'Microsoft YaHei'
    };

    init$ = new BehaviorSubject<boolean>(false);

    labelOptions: {
        nearFar?: [number, number];
    } = { nearFar: [0, 10000] };

    constructor() {
        fetch('/assets/facility/facility_icons.json')
            .then(res => res.json())
            .then(res => {
                this.iconList = res;
                this.init$.next(true);
            });
    }

    // 图标列表
    iconList: { name: string; path: string; color: string }[] = [];

    // 目前标签的列表
    private labels = new Map<string, IconInstance<any>>();

    getIconDefByName(name: string) {
        return this.iconList.find(icon => icon.name === name);
    }

    async createIconLabel<T = unknown>(
        id: string,
        options: {
            type: string | number;
            name: string;
            lon: number;
            lat: number;
            height: number;
            title?: string;
            attribute?: T;
            hasSelfIco?: boolean;
        }
    ) {
        if (this.labels.has(id)) {
            return this.labels.get(id) as IconInstance<T>;
        }
        // 如果不是从后台拿取标签图标
        if (!options.hasSelfIco) {
            // 找到对应的图标
            const icon = this.iconList.find(icon => icon.name === options.name);
            if (!icon) {
                console.error('未找到图标');
                return;
            }
            const instance = new IconInstance(id, options.type, {
                lon: options.lon,
                lat: options.lat,
                height: options.height,
                nearFar: this.labelOptions.nearFar
            });
            if (options.attribute) instance.setAttribute(options.attribute);
            // instance.createLabel(options.name, icon.color);
            // instance.createBillboard(icon.path);
            // const imgUrl = await combineIconAndLabel(
            //     icon.path,
            //     options.title || options.name,
            //     LabelsController.settings.labelSize,
            //     icon.color
            // );

            // const _destroy = instance.destroy.bind(this);
            //
            // instance.destroy = () => {
            //     _destroy();
            //     this.labels.delete(id);
            // };

            instance.createLabel(options.title || options.name, icon.color);
            instance.createBillboard(
                icon.path,
                combineIconAndLabel['width'],
                combineIconAndLabel['height']
            );
            instance.createLine(icon.color);

            ThreeDimensionalContextService.Instance.viewer.scene.primitives.add(
                instance.getPrimitive()
            );

            this.labels.set(id, instance);
            return instance;
        } else {
            const instance = new IconInstance(id, options.type, {
                lon: options.lon,
                lat: options.lat,
                height: options.height,
                nearFar: this.labelOptions.nearFar
            });
            if (options.attribute) instance.setAttribute(options.attribute);

            instance.createLabel(options.title || options.name, 'red');
            instance.createBillboard(
                // icon.path,
                combineIconAndLabel['width'],
                combineIconAndLabel['height']
            );
            instance.createLine('red');

            ThreeDimensionalContextService.Instance.viewer.scene.primitives.add(
                instance.getPrimitive()
            );

            this.labels.set(id, instance);
            return instance;
        }
    }

    getIconInstanceById(id: string) {
        return this.labels.get(id);
    }

    remove(id: string) {
        const hit = this.labels.get(id);
        if (hit) hit.destroy();
        this.labels.delete(id);
    }

    removeByType(type: string) {
        this.labels.forEach((labelInstance, id) => {
            if (labelInstance.type === type) {
                labelInstance.destroy();
                this.labels.delete(id);
            }
        });
    }

    removeAll() {
        this.labels.forEach(labelInstance => {
            labelInstance.destroy();
        });
        this.labels.clear();
    }
}
