/**
 * 将图层中的XXX@datasource 翻转为查询可用的datasource:xxx
 * @param string
 */
export function overturn(string: string) {
    return string.split('@').reverse().join(':');
}
