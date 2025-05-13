/**
 *  ---------------------------transform.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    transform的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/10
 *  @Param
 *  @Return
 *  @File           libs/util/src/lib/colors
 *  @Update         [time:user] 某用户更新此文件
 * */

/** hex -> rgb
 * @param {Object} hex
 * @param isArray
 */
export function hexToRgb(hex: string, isArray = false) {
    // 十六进制颜色代码的正则表达式
    // const reg = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    // 检测str是否匹配十六进制颜色的模式
    // if (!reg.test(hex)) {
    //   return;
    // }
    // 把字符串中的英文字母都变为小写字母，并将#替换为空（去掉#）
    let newStr = hex.toLowerCase().replace(/#/g, '').trim();
    const len = newStr.length;
    if (len === 3) {
        let t = '';
        for (let i = 0; i < len; i++) {
            // slice(start, end) 方法可提取字符串从start（包含） 到 end（不包含）的内容，并以新的字符串返回被提取的部分
            // concat() 方法用于连接两个或多个字符串
            // 将16进制的颜色代码为3位的补齐为6位
            t += newStr.slice(i, i + 1).concat(newStr.slice(i, i + 1));
        }
        newStr = t;
    }
    const hexChange: number[] = [];
    // 将字符串分隔，两个两个的分隔
    for (let i = 0; i < 6; i += 2) {
        const s = newStr.slice(i, i + 2);
        // parseInt() 函数可解析一个字符串，并返回一个整数
        // 如果 string 以 "0x" 开头，parseInt() 会把 string 的其余部分解析为十六进制的整数。
        hexChange.push(parseInt(`0x${s}`, 16));
    }
    // 字符串拼接为rgb格式的颜色代码
    return isArray ? hexChange : `RGB(${hexChange.join(',')})`;
}
