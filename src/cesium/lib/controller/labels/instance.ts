import { createLabelGraphics } from '../../components/label';

export class IconInstance<T> {
    labelCollection = new Cesium.LabelCollection({
        blendOption: Cesium.BlendOption.TRANSLUCENT
    });

    billboardCollection = new Cesium.BillboardCollection({
        blendOption: Cesium.BlendOption.TRANSLUCENT
    });

    primitiveCollection = new Cesium.PrimitiveCollection();

    attribute?: T;

    bottom;

    ground;

    constructor(
        public id: string,
        public type: string | number,
        private option: {
            lon: number;
            lat: number;
            height: number;
            nearFar?: [number, number];
        }
    ) {
        const { lon, lat, height } = option;
        this.primitiveCollection.add(this.labelCollection);
        this.primitiveCollection.add(this.billboardCollection);
        this.bottom = Cesium.Cartesian3.fromDegrees(lon, lat, height);
        // 地面的显示位置
        this.ground = Cesium.Cartesian3.fromDegrees(lon, lat, height + 10);
    }

    setAttribute(attr: T) {
        this.attribute = attr;
        return this;
    }

    createLabel(text: string, color: string) {
        return this.labelCollection.add({
            ...createLabelGraphics(Cesium.Color.fromCssColorString(color)),
            id: this.id,
            text,
            position: this.ground,
            distanceDisplayCondition: this.option.nearFar
                ? new Cesium.DistanceDisplayCondition(
                      this.option.nearFar[0],
                      this.option.nearFar[1]
                  )
                : undefined,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER
        });
    }

    createBillboard(path: string, width = 50, height = 50) {
        return this.billboardCollection.add({
            position: this.ground,
            image: path,
            id: this.id,
            width,
            height,
            distanceDisplayCondition: this.option.nearFar
                ? new Cesium.DistanceDisplayCondition(
                      this.option.nearFar[0],
                      this.option.nearFar[1]
                  )
                : undefined,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            pixelOffset: new Cesium.Cartesian2(0.0, -30)
        });
    }

    // 创建线条
    createLine(color: string) {
        // 显示距离
        const distanceDisplayCondition = this.option.nearFar
            ? new Cesium.DistanceDisplayConditionGeometryInstanceAttribute(
                  this.option.nearFar[0],
                  this.option.nearFar[1]
              )
            : undefined;
        const polyline = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.PolylineGeometry({
                    positions: [this.bottom, this.ground],
                    width: 3.0,
                    vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
                    arcType: Cesium.ArcType.NONE
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                        Cesium.Color.fromCssColorString(color)
                    ),
                    distanceDisplayCondition
                }
            }),
            appearance: new Cesium.PolylineMaterialAppearance({
                material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
                    color: Cesium.Color.fromCssColorString(color), //线条颜色
                    gapColor: Cesium.Color.TRANSPARENT, //间隔颜色
                    dashLength: 20 //短划线长度
                })
            })
        });

        return this.primitiveCollection.add(polyline);
    }

    getPrimitive() {
        return this.primitiveCollection;
    }

    destroy() {
        this.primitiveCollection.show = !this.primitiveCollection.show;
        // this.primitiveCollection.destroy();
    }
}
