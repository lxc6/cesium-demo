/**
 *  ---------------------------pxToCm.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    说明
 *  @Version        0.0.1
 *  @Author         Xia zongcheng
 *  @Date           2023/8/18
 *  @File           twins-3d\libs\utility\cesium\src\lib\tools\pxToCm.ts
 *  @Update         [time:user] 某用户更新此文件
 * */

/**
 * @description 屏幕像素转换厘米
 * @param pixel { number } 屏幕像素
 * @returns { number } 转换后的厘米
 * */
export function convertPixelToCm(pixel): number {
  const dpi = window.devicePixelRatio * 96; // 默认96dpi
  const cm = (pixel / dpi) * 2.54;
  return +cm.toFixed(2); // 保留两位小数
}
