/**
 *  ---------------------------popup.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    popup的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/14
 *  @Param
 *  @Return
 *  @File           libs/feature/core/src/lib/cesium/components
 *  @Update         [time:user] 某用户更新此文件
 * */

export interface PopupOptions {
    id: string;
    viewer: typeof Cesium.Viewer;
    type?: string | number;
    // 自定义html是的class
    insetClass?: string;

    position?: typeof Cesium.Cartesian3;
    // 像素偏移
    pixelOffset?: typeof Cesium.Cartesian2;
    show?: boolean;
    // 是否在地球背面隐藏
    hideOnBehindGlobe?: boolean;
    scaleByDistance?: typeof Cesium.NearFarScalar;
    translucencyByDistance?: typeof Cesium.NearFarScalar;
    distanceDisplayCondition?: typeof Cesium.DistanceDisplayCondition;
}

/**
 * cesium的弹窗组件，使用时传入viewer对象与相关配置后调用create函数
 * 支持字符串模板，元素与自定义组件方法
 */
export class CesiumPopup {
    type: string | number;

    private readonly viewer: typeof Cesium.Viewer;

    private position;

    private pixelOffset;

    show = false;

    private listener?: typeof Cesium.Event.RemoveCallback;

    scratch = new Cesium.Cartesian2();

    element: HTMLElement | null = null;

    readonly id: string;

    /**
     * 创建一个UL的字符串列表 本身调用
     * @param attrs 属性对象
     * @param className
     */
    static createAttrListHtml(attrs: object, className = 'attr-list') {
        const reg = /[\u4E00-\u9FA5]+/;
        if (!Object.keys(attrs).length) return '';
        // 返回一个html 字符串
        return [
            `<ul class="${className}">`,
            ...Object.keys(attrs)
                .filter(a => reg.test(a))
                .map(name => {
                    return `<li><span>${name}：</span><span>${attrs[name] || '/'}</span></li>`;
                }),
            '</ul>'
        ].join('');
    }

    constructor(private popupMap: Map<string, CesiumPopup>, protected options: PopupOptions) {
        this.type = options.type || 'default';
        this.id = options.id;
        this.viewer = options.viewer;
        this.position = options.position;
        this.show = options.show || false;
        this.pixelOffset = options.pixelOffset || new Cesium.Cartesian2(0, 0);
    }

    // 创建一个新的元素
    // component.element 类名、标签元素
    create(component: { element?: string | Element; html?: string }) {
        if (!component.html && !component.element) {
            console.error('至少传入一种实现方式');
            return;
        }
        const opt = this.options;
        if (!this.viewer) {
            console.log('Popup :viewer is required!');
            return;
        }

        if (this.element) this.element.remove();

        this.show = true;

        // 如果传入的是字符串
        if (typeof component.element === 'string') {
            this.element =
                document.querySelector(component.element) ||
                document.getElementById(component.element);
        } else if (component.element instanceof HTMLElement) {
            this.element = component.element;
        } else {
            const parent = document.createElement('div');
            parent.innerHTML = component.html || '<div></div>';
            const dom = parent.firstChild as HTMLDivElement;
            if (opt.insetClass) dom.classList.add(opt.insetClass);
            this.element = parent;
        }
        if (!this.element) {
            console.error('没有找到DOM元素，无法创建，请检查传入的dom标识或元素是否存在');
            return;
        }

        this.viewer.container.appendChild(this.element);
        // if (this.element.id !== 'PopupPipeTagComponent') {
        //   // 添加元素并且设置基本样式
        //   this.element.classList.add('popup-container1');
        // } else {
        //   this.element.classList.add('popup-container2');
        // }

        this.element.classList.add('open');

        if (opt.position) {
            this.setPosition(opt.position);
        }

        this.listener = this.viewer.camera.changed.addEventListener(this.update.bind(this));
        return this;
    }

    update() {
        if (this.show) this.setPosition(this.position);
    }

    setPosition(position: typeof Cesium.Cartesian3) {
        const canvasPosition = this.viewer.scene.cartesianToCanvasCoordinates(
            position,
            this.scratch
        );

        if (Cesium.defined(canvasPosition) && this.element) {
            const top = canvasPosition.y + this.pixelOffset.y;
            const left = canvasPosition.x + this.pixelOffset.x;

            this.element.style.top = `${top}px`;
            this.element.style.left = `${left}px`;
        }

        if (
            (this.options.hideOnBehindGlobe ||
                this.options.distanceDisplayCondition ||
                this.options.translucencyByDistance ||
                this.options.scaleByDistance) &&
            this.element
        ) {
            const cameraPosition = this.viewer.camera.position;
            const distance = Cesium.Cartesian3.distance(cameraPosition, position);

            // 地球背面的判断
            if (this.options.hideOnBehindGlobe) {
                const height =
                    this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cameraPosition)
                        .height + this.viewer.scene.globe.ellipsoid.maximumRadius;
                if (!(distance > height)) {
                    this.element.style.display = 'flex';
                } else {
                    this.element.style.display = 'none';
                }
            }

            // 距离显示条件条件
            if (this.options.distanceDisplayCondition) {
                if (
                    distance < this.options.distanceDisplayCondition.near ||
                    distance > this.options.distanceDisplayCondition.far
                ) {
                    this.element.style.display = 'none';
                    return;
                }
                this.element.style.display = 'block';
            }

            // 半透明度（按距离）
            if (this.options.translucencyByDistance) {
                const { translucencyByDistance } = this.options;
                if (distance < translucencyByDistance.near) {
                    this.element.style.opacity = translucencyByDistance.nearValue.toString();
                } else if (distance > translucencyByDistance.far) {
                    this.element.style.opacity = translucencyByDistance.farValue.toString();
                } else {
                    const val1 = translucencyByDistance.farValue - translucencyByDistance.nearValue;
                    const val2 = translucencyByDistance.far - translucencyByDistance.near;
                    const val3 =
                        ((distance - translucencyByDistance.near) / val2) * val1 +
                        translucencyByDistance.nearValue;
                    this.element.style.opacity = val3.toString();
                }
            }
            // 按距离缩放
            if (this.options.scaleByDistance) {
                const { scaleByDistance } = this.options;
                if (distance < scaleByDistance.near) {
                    const val = scaleByDistance.nearValue;
                    this.element.style.transform = `scale(${val}, ${val})`;
                } else if (distance > scaleByDistance.far) {
                    const val = scaleByDistance.farValue;
                    this.element.style.transform = `scale(${val}, ${val})`;
                } else {
                    const val1 = scaleByDistance.farValue - scaleByDistance.nearValue;
                    const val2 = scaleByDistance.far - scaleByDistance.near;
                    const val3 =
                        ((distance - scaleByDistance.near) / val2) * val1 +
                        scaleByDistance.nearValue;
                    this.element.style.transform = `scale(${val3}, ${val3})`;
                }
            }
        }

        this.open();
        this.position = position;
    }

    // 显示
    open() {
        this.show = true;
        this.element?.classList.remove('close');
        this.element?.classList.add('open');
    }

    // 隐藏
    close() {
        if (!this.element) return;
        this.show = false;
        this.element?.classList.add('close');
    }

    destroy() {
        if (this.listener) this.listener();
        if (this.element && this.viewer.container.contains(this.element)) {
            this.viewer.container.removeChild(this.element);
            this.element = null;
        }
        this.popupMap.delete(this.id);
    }
}
