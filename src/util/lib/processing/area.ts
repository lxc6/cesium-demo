/**
 *  ---------------------------area.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    area的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/20
 *  @Param
 *  @Return
 *  @File           libs/util/src/lib/processing
 *  @Update         [time:user] 某用户更新此文件
 * */
export const areaUnit = (area: number) =>
    area > 1000000 ? `${(area / 1000000).toFixed(2)}km²` : `${area.toFixed(2)}㎡`;
