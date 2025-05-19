/**
 * 线性差值计算
 * @param start
 * @param end
 * @param ratio
 */
export function interpolate(start, end, ratio) {
    return start + (end - start) * ratio;
}

/**
 * points 是一个二维数组，每个元素表示一个坐标点 [x, y]。
 * 函数通过迭代遍历 points 数组来查找插值段，并计算插值结果。
 * 如果找到适当的插值段，则返回插值结果；否则返回 NaN 表示无效的插值。
 * 注意：！！！此差值方法默认为每个坐标点直接为直线，如果需要曲线则需要其他方法
 * @param points 坐标点数组
 * @param x      差值位置
 */
export function linearInterpolationOfPoints(points: [number, number][], x: number): number {
    const n = points.length;

    for (let i = 1; i < n; i++) {
        if (x >= points[i - 1][0] && x <= points[i][0]) {
            const [x1, y1] = points[i - 1];
            const [x2, y2] = points[i];
            return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
        }
    }

    return NaN;
}
