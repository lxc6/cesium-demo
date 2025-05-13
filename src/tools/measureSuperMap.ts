// import { areaUnit, distanceUnit, ChainNodeExecutor } from '@tvp/util';
// import { BaseCesiumScene } from '../baseCesiumScene';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { ThreeDimensionalContextService } from '../view';

// /**
//  *  ---------------------------measure.ts-------------------------
//  *  @Example        使用示例代码
//  *  @Description    measure的使用说明
//  *  @Version        0.0.1
//  *  @Author         xsli1
//  *  @Date           2023/4/19
//  *  @Param
//  *  @Return
//  *  @File           libs/feature/core/src/lib/cesium/tools
//  *  @Update         [time:user] 某用户更新此文件
//  * */

// /**
//  * 绘制、量算的几何对象的风格
//  */
// export enum ClampMode {
//     Space,
//     Ground,
//     S3mModel,
//     Raster,
//     Both
// }

// /**
//  * 量算模式类
//  */
// export enum MeasureMode {
//     Distance,
//     Area,
//     DVH,
//     DVHX
// }

// interface LineDistance {
//     distance: string;
//     positions: unknown;
// }

// /**
//  * 三维量算, 继承了FeatureExecutor任务链节点
//  * 调用时会执行doExecute函数
//  */
// export class MeasureSuperMap extends ChainNodeExecutor {
//     // 保存的测量结果
//     static MeasureRefs: Array<MeasureSuperMap> = [];

//     // 清空测量结果
//     static clearMeasureRefs() {
//         // console.log(MeasureSuperMap.MeasureRefs, 'MeasureSuperMap.MeasureRefs');
//         MeasureSuperMap.MeasureRefs.forEach(mm => {
//             mm.save = false;
//             mm.destroy();
//         });
//         MeasureSuperMap.MeasureRefs.length = 0;
//     }

//     private activeMeasure?: typeof Cesium.MeasureHandler;

//     private labels: (typeof Cesium.Entity)[] = [];

//     drawEnd$: BehaviorSubject<LineDistance | ''> = new BehaviorSubject('');

//     getDrawResult() {
//         return this.drawEnd$.asObservable();
//     }

//     setDrawResult(val) {
//         this.drawEnd$.next(val);
//     }

//     handlers = {
//         [Cesium.MeasureMode.Distance]: ({
//             distance,
//             positions
//         }: {
//             distance: string;
//             positions: (typeof Cesium.Cartesian3)[];
//         }) => {
//             if (this.activeMeasure) {
//                 // 模式不同 调用方式不一致
//                 // if (this.activeMeasure.clampMode !== ClampMode.Ground) {
//                 //     this.activeMeasure.disLabel.text = `总距离:${distanceUnit(Number(distance))}`;
//                 //     return;
//                 // }

//                 const result = {
//                     distance,
//                     positions
//                 };
//                 this.setDrawResult(result);
//                 this.clearLabelText();
//                 // XXX: 每次区间距离因为四舍五入的关系可能会与总距离有十位公分的差距
//                 positions.forEach((position, index) => {
//                     const labelRef = this.BCS.labelPool.getObject();
//                     labelRef.label.text = this.createLabelText(index, positions, Number(distance));
//                     labelRef.label.fillColor = Cesium.Color.WHITE; //文字颜色
//                     labelRef.label.font = '14px sans-serif';
//                     labelRef.label.outlineColor =
//                         Cesium.Color.fromCssColorString('rgba(255,255,255,0)'); // 文字边框色
//                     labelRef.label.backgroundColor = Cesium.Color.fromCssColorString('#3974F6'); // 背景色
//                     labelRef.label.backgroundPadding = new Cesium.Cartesian2(10, 10); // 边距
//                     labelRef.label.borderBottomLeftRadius = '5px';
//                     labelRef.position = position;
//                     this.BCS.viewer.entities.add(labelRef);
//                     this.labels.push(labelRef);
//                 });
//             }
//         },
//         [MeasureMode.Area]: ({
//             area,
//             positions
//         }: {
//             area: string;
//             positions: (typeof Cesium.Cartesian3)[];
//         }) => {
//             this.activeMeasure.areaLabel.text = `面积:${areaUnit(Number(area))}`;
//             this.activeMeasure.areaLabel.fillColor = Cesium.Color.WHITE; //文字颜色
//             this.activeMeasure.areaLabel.font = '14px sans-serif';
//             this.activeMeasure.areaLabel.outlineColor =
//                 Cesium.Color.fromCssColorString('rgba(255,255,255,0)'); // 文字边框色
//             this.activeMeasure.areaLabel.backgroundColor =
//                 Cesium.Color.fromCssColorString('#3974F6'); // 背景色
//             this.activeMeasure.areaLabel.backgroundPadding = new Cesium.Cartesian2(10, 10); // 边距
//             this.activeMeasure.areaLabel.borderBottomLeftRadius = '5px';
//             const result = {
//                 area,
//                 positions
//             };
//             this.setDrawResult(result);
//         },
//         [MeasureMode.DVH]: ({
//             distance,
//             verticalHeight,
//             horizontalDistance
//         }: {
//             distance: string;
//             verticalHeight: string;
//             horizontalDistance: string;
//             endHeight: string;
//         }) => {
//             if (this.activeMeasure) {
//                 this.activeMeasure.disLabel.text = `空间距离:${distanceUnit(Number(distance))}`;
//                 this.activeMeasure.vLabel.text = `垂直高度:${distanceUnit(Number(verticalHeight))}`;
//                 this.activeMeasure.hLabel.text = `水平距离:${distanceUnit(
//                     Number(horizontalDistance)
//                 )}`;
//             }
//         }
//     };

//     public save = true;

//     constructor(private BCS: BaseCesiumScene) {
//         // 不允许点击模型
//         ThreeDimensionalContextService.isClickModel = false;
//         // 设置透明度为0.5
//         ThreeDimensionalContextService.Instance.toggleAlpha(0.5);
//         super();
//     }

//     createLabelText(index: number, positions: (typeof Cesium.Cartesian3)[], distance: number) {
//         const current = positions[index];
//         if (index === 0) {
//             return new Cesium.ConstantProperty('起点');
//         }
//         if (index > 0 && index < positions.length - 1) {
//             const last = positions[index - 1];
//             return new Cesium.ConstantProperty(
//                 `区间长度： ${distanceUnit(Cesium.Cartesian3.distance(current, last))}`
//             );
//         }
//         const last = positions[index - 1];
//         return new Cesium.ConstantProperty(
//             `区间长度：${distanceUnit(
//                 Cesium.Cartesian3.distance(current, last)
//             )} \n总长度：${distanceUnit(distance)}`
//         );
//     }

//     clearLabelText() {
//         this.labels.forEach(entity => {
//             this.BCS.labelPool.releaseObject(entity);
//         });
//         this.labels.length = 0;
//     }

//     /**
//      * 初始化量算，默认测距，贴地
//      * @param mode      测量模式
//      * @param clampMode 贴线模式
//      * @param save      是否保存测量结果
//      */
//     async doExecute(
//         mode: MeasureMode = MeasureMode.Distance,
//         clampMode: ClampMode = ClampMode.Space,
//         save = true
//     ): Promise<[boolean, Observable<LineDistance | ''>]> {
//         this.save = save;
//         // this.BCS.settings.clickEvent.enable = false;
//         const activeMeasure = new Cesium.MeasureHandler(this.BCS.viewer, mode, clampMode);
//         activeMeasure.measureEvt.addEventListener(this.handlers[mode]);
//         activeMeasure.activate();
//         this.activeMeasure = activeMeasure;
//         if (save) {
//             MeasureSuperMap.MeasureRefs.push(this);
//         }
//         return new Promise(resolve => {
//             activeMeasure.activeEvt.addEventListener(() => {
//                 if (mode === MeasureMode.Area) {
//                     setTimeout(() => {
//                         this.activeMeasure.polyline.show = false;
//                     }, 150);
//                 }
//                 resolve([true, this.getDrawResult()]);
//                 console.log(this.activeMeasure, '能否将entity转为geojson');
//                 // this.activeMeasure.polyline.show = false;
//                 this.BCS.settings.clickEvent.enable = true;
//             });
//         });
//     }

//     override cancel() {
//         // 允许点击模型
//         ThreeDimensionalContextService.isClickModel = true;
//         // 设置透明度1
//         ThreeDimensionalContextService.Instance.toggleAlpha(1);
//         this.save = false;
//         this.reset();
//     }

//     reset(): void {
//         this.activeMeasure?.deactivate();
//         this.BCS.settings.clickEvent.enable = true;
//         if (this.save) return;
//         this.activeMeasure?.clear();
//         this.clearLabelText();
//     }

//     destroy(): void {
//         console.log('destroy');
//         // 允许点击模型
//         ThreeDimensionalContextService.isClickModel = true;
//         // 设置透明度1
//         ThreeDimensionalContextService.Instance.toggleAlpha(1);
//         this.reset();
//         // this.activeMeasure?.destroy();
//         // this.activeMeasure = undefined;
//     }
// }
