// /**
//  * 测量管理器类
//  * 用于管理和控制场景中的测量功能，如距离、面积等测量
//  */
// export class MeasureManager {
//     private viewer: Cesium.Viewer;
//     private activeMeasure?: typeof Cesium.MeasureHandler;
//     private labels: (typeof Cesium.Entity)[] = [];
//     private onDrawEnd?: (result: any) => void;

//     constructor(viewer: Cesium.Viewer) {
//         this.viewer = viewer;
//     }

//     /**
//      * 设置绘制结束回调
//      */
//     setDrawEndCallback(callback: (result: any) => void) {
//         this.onDrawEnd = callback;
//     }

//     /**
//      * 触发绘制结果回调
//      */
//     private notifyDrawEnd(result: any) {
//         if (this.onDrawEnd) {
//             this.onDrawEnd(result);
//         }
//     }

//     /**
//      * 创建标签文本
//      */
//     private createLabelText(
//         index: number,
//         positions: (typeof Cesium.Cartesian3)[],
//         distance: number
//     ) {
//         const current = positions[index];
//         if (index === 0) {
//             return new Cesium.ConstantProperty('起点');
//         }
//         if (index > 0 && index < positions.length - 1) {
//             const last = positions[index - 1];
//             return new Cesium.ConstantProperty(
//                 `区间长度： ${this.formatDistance(
//                     Cesium.Cartesian3.distance(current, last)
//                 )}`
//             );
//         }
//         const last = positions[index - 1];
//         return new Cesium.ConstantProperty(
//             `区间长度：${this.formatDistance(
//                 Cesium.Cartesian3.distance(current, last)
//             )} \n总长度：${this.formatDistance(distance)}`
//         );
//     }

//     /**
//      * 格式化距离显示
//      */
//     private formatDistance(distance: number): string {
//         if (distance >= 1000) {
//             return `${(distance / 1000).toFixed(2)}km`;
//         }
//         return `${distance.toFixed(2)}m`;
//     }

//     /**
//      * 清除标签
//      */
//     private clearLabels() {
//         this.labels.forEach((label) => {
//             this.viewer.entities.remove(label);
//         });
//         this.labels = [];
//     }

//     /**
//      * 开始距离测量
//      */
//     startDistanceMeasure(clampToGround = true) {
//         this.clearLabels();
//         if (this.activeMeasure) {
//             this.activeMeasure.deactivate();
//             this.activeMeasure = undefined;
//         }

//         this.activeMeasure = new Cesium.MeasureHandler(
//             this.viewer,
//             Cesium.MeasureMode.Distance,
//             clampToGround ? 1 : 0
//         );

//         // 激活测量工具
//         this.activeMeasure.activate();

//         // 监听测量结果
//         this.activeMeasure.measureEvt.addEventListener(
//             ({ distance, positions }) => {
//                 this.clearLabels();
//                 positions.forEach((position, index) => {
//                     const label = new Cesium.Entity({
//                         position,
//                         label: {
//                             text: this.createLabelText(
//                                 index,
//                                 positions,
//                                 distance
//                             ),
//                             fillColor: Cesium.Color.WHITE,
//                             font: '14px sans-serif',
//                             outlineColor: Cesium.Color.fromCssColorString(
//                                 'rgba(255,255,255,0)'
//                             ),
//                             backgroundColor:
//                                 Cesium.Color.fromCssColorString('#3974F6'),
//                             backgroundPadding: new Cesium.Cartesian2(10, 10),
//                             style: Cesium.LabelStyle.FILL_AND_OUTLINE,
//                         },
//                     });
//                     this.viewer.entities.add(label);
//                     this.labels.push(label);
//                 });

//                 this.notifyDrawEnd({ distance, positions });
//             }
//         );
//     }

//     /**
//      * 开始面积测量
//      */
//     startAreaMeasure(clampToGround = true) {
//         this.clearLabels();
//         if (this.activeMeasure) {
//             this.activeMeasure.deactivate();
//             this.activeMeasure = undefined;
//         }

//         this.activeMeasure = new Cesium.MeasureHandler(
//             this.viewer,
//             Cesium.MeasureMode.Area,
//             clampToGround ? 1 : 0
//         );

//         // 激活测量工具
//         this.activeMeasure.activate();

//         // 监听测量结果
//         this.activeMeasure.measureEvt.addEventListener(
//             ({ area, positions }) => {
//                 const label = new Cesium.Entity({
//                     position: positions[positions.length - 1],
//                     label: {
//                         text: `面积: ${this.formatArea(area)}`,
//                         fillColor: Cesium.Color.WHITE,
//                         font: '14px sans-serif',
//                         outlineColor: Cesium.Color.fromCssColorString(
//                             'rgba(255,255,255,0)'
//                         ),
//                         backgroundColor:
//                             Cesium.Color.fromCssColorString('#3974F6'),
//                         backgroundPadding: new Cesium.Cartesian2(10, 10),
//                         style: Cesium.LabelStyle.FILL_AND_OUTLINE,
//                     },
//                 });
//                 this.viewer.entities.add(label);
//                 this.labels.push(label);

//                 this.notifyDrawEnd({ area, positions });
//             }
//         );
//     }

//     /**
//      * 格式化面积显示
//      */
//     private formatArea(area: number): string {
//         if (area >= 1000000) {
//             return `${(area / 1000000).toFixed(2)}km²`;
//         }
//         return `${area.toFixed(2)}m²`;
//     }

//     /**
//      * 停止测量
//      */
//     stopMeasure() {
//         if (this.activeMeasure) {
//             this.activeMeasure.deactivate();
//             this.activeMeasure = undefined;
//         }
//         this.clearLabels();
//         this.notifyDrawEnd(null);
//     }

//     /**
//      * 销毁管理器
//      */
//     destroy() {
//         this.stopMeasure();
//         this.onDrawEnd = undefined;
//     }
// }
