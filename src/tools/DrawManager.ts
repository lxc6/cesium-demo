// // import { BehaviorSubject } from 'rxjs';

// /**
//  * 绘制管理器类
//  * 用于管理和控制场景中的绘制功能，如线、面、点等几何图形
//  */
// export class DrawManager {
//     private viewer: Cesium.Viewer;
//     private drawHandler?: typeof Cesium.DrawHandler;
//     private drawEnd$ = new BehaviorSubject<any>('');

//     constructor(viewer: Cesium.Viewer) {
//         this.viewer = viewer;
//     }

//     /**
//      * 获取绘制结果
//      */
//     getDrawResult() {
//         return this.drawEnd$.asObservable();
//     }

//     /**
//      * 设置绘制结果
//      */
//     setDrawResult(val: any) {
//         this.drawEnd$.next(val);
//     }

//     /**
//      * 开始绘制点
//      */
//     startDrawPoint() {
//         this.stopDraw();
//         this.drawHandler = new Cesium.DrawHandler(
//             this.viewer,
//             Cesium.DrawMode.Point
//         );
//         this.drawHandler.activate();

//         this.drawHandler.drawEvt.addEventListener((result) => {
//             this.setDrawResult(result);
//         });
//     }

//     /**
//      * 开始绘制线
//      */
//     startDrawLine() {
//         this.stopDraw();
//         this.drawHandler = new Cesium.DrawHandler(
//             this.viewer,
//             Cesium.DrawMode.Line
//         );
//         this.drawHandler.activate();

//         this.drawHandler.drawEvt.addEventListener((result) => {
//             this.setDrawResult(result);
//         });
//     }

//     /**
//      * 开始绘制面
//      */
//     startDrawPolygon() {
//         this.stopDraw();
//         this.drawHandler = new Cesium.DrawHandler(
//             this.viewer,
//             Cesium.DrawMode.Polygon
//         );
//         this.drawHandler.activate();

//         this.drawHandler.drawEvt.addEventListener((result) => {
//             this.setDrawResult(result);
//         });
//     }

//     /**
//      * 开始绘制矩形
//      */
//     startDrawRectangle() {
//         this.stopDraw();
//         this.drawHandler = new Cesium.DrawHandler(
//             this.viewer,
//             Cesium.DrawMode.Rectangle
//         );
//         this.drawHandler.activate();

//         this.drawHandler.drawEvt.addEventListener((result) => {
//             this.setDrawResult(result);
//         });
//     }

//     /**
//      * 开始绘制圆
//      */
//     startDrawCircle() {
//         this.stopDraw();
//         this.drawHandler = new Cesium.DrawHandler(
//             this.viewer,
//             Cesium.DrawMode.Circle
//         );
//         this.drawHandler.activate();

//         this.drawHandler.drawEvt.addEventListener((result) => {
//             this.setDrawResult(result);
//         });
//     }

//     /**
//      * 停止绘制
//      */
//     stopDraw() {
//         if (this.drawHandler) {
//             this.drawHandler.deactivate();
//             this.drawHandler = undefined;
//         }
//         this.setDrawResult('');
//     }

//     /**
//      * 销毁管理器
//      */
//     destroy() {
//         this.stopDraw();
//         this.drawEnd$.complete();
//     }
// }
