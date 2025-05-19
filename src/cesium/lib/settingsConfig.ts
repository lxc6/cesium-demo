/**
 *  ---------------------------settingsConfig.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    settingsConfig的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/13
 *  @Param
 *  @Return
 *  @File           libs/feature/core/src/lib/cesium
 *  @Update         [time:user] 某用户更新此文件
 * */
import { ClickEventSetting } from './settings/click';

export function setUpSettings() {
    return {
        // 点击事件
        clickEvent: new ClickEventSetting()
    };
}
