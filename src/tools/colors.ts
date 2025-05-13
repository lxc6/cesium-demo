import { hexToRgb } from '@/utils/colorTransform';

/**
 *  ---------------------------fly.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    fly的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/17
 *  @Param
 *  @Return
 *  @File           libs/feature/core/src/lib/cesium/tools
 *  @Update         [time:user] 某用户更新此文件
 * */

/**
 * 转换底图颜色
 * @param viewer
 * @param options
 */
export function modifyMap(viewer: any, options: { [key: string]: any }) {
    const baseLayer = viewer.imageryLayers.get(0);
    // 以下几个参数根据实际情况修改,目前我是参照火星科技的参数,个人感觉效果还不错
    baseLayer.brightness = options['brightness'] || 0.6;
    baseLayer.contrast = options['contrast'] || 1.8;
    baseLayer.gamma = options['gamma'] || 0.3;
    baseLayer.hue = options['hue'] || 1;
    baseLayer.saturation = options['saturation'] || 0;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const baseFragShader =
        viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources;
    for (let i = 0; i < baseFragShader.length; i++) {
        const strS =
            'color = czm_saturation(color, textureSaturation);\n#endif\n';
        let strT =
            'color = czm_saturation(color, textureSaturation);\n#endif\n';
        if (options['invertColor']) {
            strT += `
      color.r = 1.0 - color.r;
      color.g = 1.0 - color.g;
      color.b = 1.0 - color.b;
      `;
        }
        if (options['filterRGB'].length > 0) {
            strT += `
      color.r = color.r * ${options['filterRGB'][0]}.0/255.0;
      color.g = color.g * ${options['filterRGB'][1]}.0/255.0;
      color.b = color.b * ${options['filterRGB'][2]}.0/255.0;
      `;
        }
        baseFragShader[i] = baseFragShader[i].replace(strS, strT);
    }
}

// 根据主题修改底图颜色
export function createCustomTheme(viewer: Cesium.Viewer) {
    const themeColor = getComputedStyle(
        document.documentElement
    ).getPropertyValue('--color-secondary');
    // 采用系统主题色
    if (themeColor && hexToRgb(themeColor)) {
        modifyMap(viewer, {
            invertColor: true,
            // 滤色值
            filterRGB: hexToRgb(themeColor, true),
        });
    }
}
