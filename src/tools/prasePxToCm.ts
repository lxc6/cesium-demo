/**
 * @description 屏幕像素转换厘米
 * @param pixel { number } 屏幕像素
 * @returns { number } 转换后的厘米
 * */
export function convertPixelToCm(pixel: any): number {
    const dpi = window.devicePixelRatio * 96; // 默认96dpi
    const cm = (pixel / dpi) * 2.54;
    return +cm.toFixed(2); // 保留两位小数
}
