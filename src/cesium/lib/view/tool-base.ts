/**
 *  ---------------------------tool-base.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    tool-base的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/5/15
 *  @Param
 *  @Return
 *  @File           apps/graphics-system/src/app/components/tools
 *  @Update         [time:user] 某用户更新此文件
 * */
import { Print, ToolRow } from '@/util';
import { ThreeDimensionalContextService, ViewMode } from '@/cesium';

export class ToolBase {
    async startTool(row: ToolRow) {
        if (row.fn) {
            if (row.val) {
                return row.fn(row.val);
            }
            return row.fn();
        }
        if (!row.task) return;
        const task = ThreeDimensionalContextService.Instance.taskManager;
        ThreeDimensionalContextService.viewMode$.next(ViewMode.WORKING);
        return task
            .run(row.name, row.task)
            .start(...(row.taskParameter || []))
            .then((result) => {
                Print.Info('执行结果：', result);
            })
            .finally(() => {
                ThreeDimensionalContextService.viewMode$.next(ViewMode.IDLE);
            });
    }

    destroy() {
        // this.activeRow = undefined;
    }
}
