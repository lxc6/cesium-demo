import { ChainStatus, FunctionTaskNode, TaskFuncDef, TaskLiteralDef, TaskNodeType } from './type';
import { BehaviorSubject, filter, Subject } from 'rxjs';
import { ChainNodeExecutor } from './task-node';

export class TaskChain<T extends Array<any>, S extends Array<unknown>> {
    status = ChainStatus.waiting;

    taskIndex = 0;

    cancel$ = new BehaviorSubject<boolean>(false);

    complete$ = new Subject<boolean>();

    private successfully = true;

    private featureChainsResult: unknown[] = [];

    private closingWorks: ((...shared: S) => void)[] = [];

    private readonly taskTodoList: (
        | TaskFuncDef<S>
        | { type: TaskNodeType.class; node: ChainNodeExecutor }
    )[];

    featureChainsStatus: ChainStatus[] = [];

    constructor(taskList: Array<TaskFuncDef<S> | TaskLiteralDef<any, S>>, private shared: S) {
        this.taskTodoList = taskList.map(def => {
            if (def.type === TaskNodeType.function) return def;
            else
                return {
                    type: TaskNodeType.class,
                    node: new def.node(...shared)
                };
        });
    }

    // 开始执行
    async start(...args: unknown[]) {
        let result = args;
        this.status = ChainStatus.executing;
        // 通过while循环列表，终止状态为：自然执行-ChainStatus.complete，外部取消-ChainStatus.cancel，内部错误-ChainStatus.error
        while (this.taskIndex < this.taskTodoList.length && !this.cancel$.getValue()) {
            // 获取当前节点
            const current = this.taskTodoList[this.taskIndex];
            try {
                // 判断是否函数
                if (current.type === TaskNodeType.function) {
                    result = await this.executeFn(current.node, ...result);
                } else {
                    result = await this.executeCls(current.node, ...result);
                }
            } catch (e) {
                console.error(e);
                this.status = ChainStatus.error;
                this.successfully = false;
                break;
            }
            this.taskIndex++;
            this.featureChainsResult.push(result);
        }
        return this.complete();
    }

    async executeFn(node: FunctionTaskNode<unknown[], S>, ...params: unknown[]) {
        const outcome = await node(this.cancel$.pipe(filter(v => v)), this.shared, ...params);
        // 如果没有返回值 或者状态不通过
        if (!outcome) {
            throw new Error('任务发生错误');
        }
        if (!this.checkTask(outcome.status) || !outcome.result) {
            throw new Error(outcome.status);
        }
        // 如果有回收程序
        if (outcome.cleanup) {
            this.closingWorks.push(outcome.cleanup);
        }
        return outcome.result;
    }

    async executeCls(node: ChainNodeExecutor, ...params: unknown[]) {
        const outcome = await node.execute(...params);
        if (!this.checkTask(node.status) || !outcome) {
            throw new Error(node.status);
        }
        return outcome;
    }

    private checkTask(status: ChainStatus) {
        this.featureChainsStatus.push(status);
        switch (status) {
            case ChainStatus.cancel:
            case ChainStatus.error:
                this.successfully = false;
                break;
            case ChainStatus.complete:
                this.successfully = true;
                break;
            default:
                this.successfully = false;
        }
        return this.successfully;
    }

    // 中断当前任务链的执行，循环调用子节点的destroy
    interrupt() {
        this.cancel$.next(true);
        this.cancel$.complete();
        this.status = ChainStatus.cancel;
        // 从当前执行的下标开始调用子节点的cancel，调用之前的所有destroy函数

        for (let i = 0; i < this.taskTodoList.length; i++) {
            const active = this.taskTodoList[i];
            if (active.type === TaskNodeType.class) {
                if (i === this.taskIndex) {
                    active.node.cancel();
                } else {
                    active.node.destroy();
                }
            }
        }
    }

    destroy() {
        console.log('销毁任务链');
        this.interrupt();
        this.taskTodoList.length = 0;
        this.complete$.complete();
    }

    private complete() {
        this.destroy();
        this.complete$.next(true);
        this.complete$.complete();
        this.closingWorks.forEach(fn => fn(...this.shared));
        this.closingWorks.length = 0;
        const status = [...this.featureChainsStatus].join(' --> ');
        this.featureChainsStatus.length = 0;
        const results = [...this.featureChainsResult];
        this.featureChainsResult.length = 0;
        return {
            successfully: this.successfully,
            status: status || this.status,
            results
        };
    }
}
