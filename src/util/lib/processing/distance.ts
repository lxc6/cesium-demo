/**
 *  ---------------------------distance.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    distance的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/20
 *  @Param
 *  @Return
 *  @File           libs/util/src/lib/processing
 *  @Update         [time:user] 某用户更新此文件
 * */
export const distanceUnit = (distance: number, decimal = 2) =>
    distance > 1000 ? `${(distance / 1000).toFixed(decimal)} km` : `${distance.toFixed(decimal)} m`;
