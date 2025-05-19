import { TaskFuncDef, TaskLiteralDef } from './type';
import { TaskChain } from './task-chain';
import { filter } from 'rxjs';

/**
 * 任务链管理器，每次生成一个任务清单
 */
export class TaskControl<S extends Array<unknown>> {
    activeChain?: TaskChain<unknown[], S>;

    // singleton暂时无用,留作以后并行处理
    constructor(private shared: S, private singleton = false) {}

    run = (id: string, featureChains: Array<TaskFuncDef<S> | TaskLiteralDef<any, S>>) => {
        this.activeChain?.destroy();
        const chain = new TaskChain(featureChains, this.shared);
        this.activeChain = chain;
        // XXX:防止用户在任务链中被取消，导致任务链被重复销毁
        chain.cancel$.pipe(filter(v => v)).subscribe(() => (this.activeChain = undefined));
        return chain;
    };

    stop() {
        console.log('销毁', this.activeChain);
        this.activeChain?.destroy();
        this.activeChain = undefined;
    }

    destroy() {
        this.activeChain?.destroy();
        this.activeChain = undefined;
    }
}
