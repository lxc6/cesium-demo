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
 * 地球旋转动画
 * @param viewer
 * @param spinRate
 */
export function rotateAnimation(viewer: Cesium.Viewer, spinRate = 500) {
    // viewer.clock.multiplier = 100;
    // viewer.clock.shouldAnimate = true;
    let previousTime = viewer.clock.currentTime.secondsOfDay;
    function onTickCallback() {
        const currentTime = viewer.clock.currentTime.secondsOfDay;
        const delta = (currentTime - previousTime) / 1000; // 每帧间隔
        const angle = spinRate * delta;
        previousTime = currentTime;
        viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, angle);
    }
    viewer.clock.onTick.addEventListener(onTickCallback);
    return () => {
        // viewer.clock.shouldAnimate = false;
        viewer.clock.onTick.removeEventListener(onTickCallback);
    };
}
