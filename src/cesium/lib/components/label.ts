export const createLabelGraphics = (
    bgColor = Cesium.Color.fromCssColorString('#6B96C1')
): typeof Cesium.LabelGraphics => ({
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    // 字体颜色
    fillColor: Cesium.Color.WHITE,
    // scale: 0.5, //先将字体大小放大一倍在缩小一倍
    // 注意！！！：font中如果写了字体样式bold会导致无限插入dom并移除的过程，千万别写
    font: '18px MicroSoft YaHei',
    // 字体边框颜色
    outlineColor: Cesium.Color.BLACK,
    // 字体边框尺寸
    outlineWidth: 2,
    // 背景颜色
    backgroundColor: bgColor,
    backgroundPadding: new Cesium.Cartesian2(8, 4),
    // 是否显示背景颜色
    showBackground: true,
    // 应用于图像的统一比例。比例大于会1.0放大标签，而比例小于会1.0缩小标签。
    // scale: 1.0,
    // 设置样式：FILL：填写标签的文本，但不要勾勒轮廓；OUTLINE：概述标签的文本，但不要填写；FILL_AND_OUTLINE：填写并概述标签文本。
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    // 相对于坐标的水平位置
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    // 相对于坐标的水平位置
    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
    // 该属性指定标签在屏幕空间中距此标签原点的像素偏移量
    pixelOffset: new Cesium.Cartesian2(0, 5),
    // 显示在距相机的距离处的属性，多少区间内是可以显示的
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
    // 是否显示
    show: true,
});
