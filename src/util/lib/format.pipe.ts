enum FormatData {
    '起点埋深' = '起点埋深(m)',
    '终点埋深' = '终点埋深(m)',
    '起点高程' = '起点高程(m)',
    '终点高程' = '终点高程(m)',
    '管径' = '管径(mm)',
    '管段间距' = '管段间距(m)',
    'SMLENGTH' = '管段长度(m)',
    '高程' = '高程(m)',
    '埋深' = '埋深(m)',
}

/**
 * 格式化数据的纯 TypeScript 实现
 * @param value 需要格式化的原始字符串
 * @returns 格式化后的字符串，如果枚举中不存在则返回原值
 */
export function format(value: string): string {
    // 使用类型断言确保安全访问枚举值
    return FormatData[value as keyof typeof FormatData] || value;
}

/* 使用示例：
console.log(format('起点埋深'));  // 输出：起点埋深(m)
console.log(format('管径'));     // 输出：管径(mm)
console.log(format('未知字段'));  // 输出：未知字段
*/
