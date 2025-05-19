// 转换图层的名字
export function convertLayerName(val: string) {
    if (!val.includes('@')) {
        console.error('图层命名不规范，缺少@符号', val);
        return val;
    }
    return val.split('@')[1];
}
