import { drawRoundedRectWithText } from '@/util';
import { LabelsController } from '@/cesium';

export const pictureStore = new Map<string, string>();

export async function combineIconAndLabel(
    url,
    label,
    size,
    color
): Promise<string> {
    const id = `${url}-${label}`;
    if (pictureStore.has(id)) return pictureStore.get(id) as string;
    const padding = 10; // 填充大小
    const { labelHeight } = LabelsController.settings;
    // 创建画布对象
    const canvas = document.createElement('canvas');
    const width = size * window.devicePixelRatio;
    const height = (size + labelHeight + padding) * window.devicePixelRatio;
    canvas.width = width;
    canvas.height = height;
    combineIconAndLabel['width'] = width;
    combineIconAndLabel['height'] = height;

    const ctx = canvas.getContext('2d', {
        willReadFrequently: true,
    }) as CanvasRenderingContext2D;

    const image = await new Cesium.Resource.fetchImage(url);
    drawRoundedRectWithText(
        ctx,
        0,
        canvas.height - labelHeight,
        canvas.width,
        labelHeight,
        6,
        color
    );

    // 计算图片的缩放比例和绘制偏移量
    const scaleX = (width - 2 * padding) / image.width;
    const scaleY = (height - 2 * padding) / image.height;
    const scale = Math.min(scaleX, scaleY); // 取较小的缩放比例，以保持图片完全可见
    const newWidth = image.width * scale;
    const newHeight = image.height * scale;
    const offsetX = (width - newWidth) / 2; // 水平偏移量
    const offsetY = (height - newHeight) / 2; // 垂直偏移量
    // 绘制图片
    ctx.drawImage(image, offsetX, offsetY, newWidth, newHeight);
    // 渲染字体
    // font属性设置顺序：font-style, font-variant, font-weight, font-size, line-height, font-family
    ctx.font = 'bold 16px Microsoft YaHei';
    ctx.textAlign = 'center';
    // ctx.strokeStyle = 'black';
    // ctx.strokeText(label, canvas.width / 2, canvas.height - 4);
    ctx.fillStyle = Cesium.Color.WHITE.toCssColorString();
    ctx.fillText(label, canvas.width / 2, canvas.height - labelHeight / 4);
    const base64 = canvas.toDataURL('image/png');
    pictureStore.set(id, base64);
    return base64;
}
