/**
 *  ---------------------------bing.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    bing的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/12
 *  @Param
 *  @Return
 *  @File           libs/feature/core/src/lib/cesium/imagerys
 *  @Update         [time:user] 某用户更新此文件
 * */

export const BING_MAP_URL = 'https://dev.virtualearth.net';
export const BING_MAP_KEY = 'AmXdbd8UeUJtaRSn7yVwyXgQlBBUqliLbHpgn2c76DfuHwAXfRrgS5qwfHU6Rhm8';

export function bingMap() {
    return new Cesium.BingMapsImageryProvider({
        url: BING_MAP_URL,
        mapStyle: Cesium.BingMapsStyle.AERIAL,
        key: BING_MAP_KEY
    });
}
