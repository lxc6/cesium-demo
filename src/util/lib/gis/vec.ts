/**
 * 已知点、线段，求垂足
 * @param line 线段；[[经度,纬度],[经度,纬度]]；例：[[116.01,40.01],[116.52,40.01]]
 * @param p 点；[经度,纬度]；例：[116.35,40.08]
 *
 * @return point 返回垂足坐标
 */
export function getFootPoint(line, p) {
    const p1 = line[0];
    const p2 = line[1];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const cross = dx * (p[0] - p1[0]) + dy * (p[1] - p1[1]);
    const d2 = dx * dx + dy * dy;
    const u = cross / d2;
    return [p1[0] + u * dx, p1[1] + u * dy];
}
