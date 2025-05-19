/**
 *  ---------------------------number.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    number的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/27
 *  @Param
 *  @Return
 *  @File           libs/util/src/lib/tools
 *  @Update         [time:user] 某用户更新此文件
 * */
// 生成一个从min到max的随机数
export function random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
