/**
 *  ---------------------------generator.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    说明
 *  @Version        0.0.1
 *  @Author         li xusheng
 *  @Date           2023/2/21
 *  @Param
 *  @Return
 *  @File           libs/util/src/util-array generator.ts
 *  @Update         [time:user] 某用户更新此文件
 * */

/**
 * 返回一个随机数组
 * @param l {number} length  数组长度
 * @param min {number} min  最小值
 * @param max {number} max  最大值
 * @returns {Array}
 */
export function createRandomArray(l: number, min: number, max: number): number[] {
    const arr: number[] = [];
    for (let i = 0; i < l; i++) {
        arr.push(Math.floor(Math.random() * (max - min + 1) + min));
    }
    return arr;
}
