/**
 * 绘制一个圆角矩形
 * @param ctx CanvasRenderingContext2D 对象，表示要在哪个 canvas 上绘制圆角矩形和文本。
 * @param x 矩形左上角的 x 坐标。
 * @param y 矩形左上角的 y 坐标。
 * @param width 矩形的宽度。
 * @param height 矩形的高度。
 * @param radius 矩形的圆角半径。
 * @param bgColor
 */
export function drawRoundedRectWithText(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    bgColor: string
): void {
    // 绘制圆角矩形
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = bgColor;
    ctx.fill();
}
