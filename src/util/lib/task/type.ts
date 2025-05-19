/**
 *  ---------------------------type.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    type的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/5/16
 *  @Param
 *  @Return
 *  @File           libs/util/src/lib/task
 *  @Update         [time:user] 某用户更新此文件
 * */
import { ChainNodeExecutor } from './task-node';
import { Observable } from 'rxjs';

export enum ChainStatus {
    waiting = 'waiting',
    starting = 'starting',
    executing = 'executing',
    complete = 'complete',
    error = 'error',
    cancel = 'cancel'
}

export interface ChainNode {
    // 任务节点执行状态
    status: ChainStatus;
}

export interface FunctionTaskNodeResponder<
    T extends Array<unknown> = [],
    S extends Array<unknown> = []
> {
    status: ChainStatus;
    result?: T;
    // 用于执行完成后清除的逻辑
    cleanup?: (...shared: S) => void;
}

export type FunctionTaskNode<
    T extends Array<unknown>,
    S extends Array<unknown> = Array<unknown>
> = (
    cancel$: Observable<boolean>,
    shared: S,
    ...args: any[]
) => Promise<FunctionTaskNodeResponder<T, S>> | FunctionTaskNodeResponder<T, S>;

export type TaskLiteral<T extends ChainNodeExecutor, S extends Array<any>> = new (
    ...shared: S
) => T;

//类任务定义
export type TaskLiteralDef<T extends ChainNodeExecutor, S extends Array<unknown> = unknown[]> = {
    type: TaskNodeType.class;
    node: TaskLiteral<T, S>;
};

// 函数任务定义
export type TaskFuncDef<S extends Array<unknown> = unknown[]> = {
    type: TaskNodeType.function;
    node: FunctionTaskNode<unknown[], S>;
};

// 任务类型
export enum TaskNodeType {
    function,
    class
}

/**
 * task函数列表只可以传递继承了FeatureExecutor的类或者普通函数。暂不支持箭头函数
 */
export interface ToolRow<T extends ChainNodeExecutor = any, S extends Array<unknown> = unknown[]> {
    name: string;
    fn?: (...args: unknown[]) => Promise<unknown> | void;
    task?: Array<TaskFuncDef<S> | TaskLiteralDef<T, S>>;
    taskParameter?: unknown[];
    icon?: string;
    id?: number;
    parentId?: number;
    val?: number;
    children?: ToolRow<T, S>[];
}
