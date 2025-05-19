/**
 *  ---------------------------direction.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    direction的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/13
 *  @Param
 *  @Return
 *  @File           libs/util/src/lib/tools
 *  @Update         [time:user] 某用户更新此文件
 * */

/**
 * 将0-360之间的值转换为方向 顺时针
 * @param degree
 */
export function degreeToDirection(degree: number | string) {
    if (typeof degree === 'string') degree = Number(degree);
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.floor(((degree + 22.5 / 2) % 360) / 45);
    return directions[index];
}
