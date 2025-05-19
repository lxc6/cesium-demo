/**
 *  ---------------------------taskChain.ts-------------------------
 *  @Example        使用示例代码
 *  @Description
 *  IFeatureChain接口，用于表示函数责任链的节点。该接口包含一个setNext方法和一个execute方法。
 *  setNext方法用于设置下一个节点，execute方法用于执行当前节点的逻辑并将结果传递给下一个节点。
 *  然后，我们实现了一个FeatureExecutor类，该类实现了IFeatureChain接口，并提供了一个doExecute方法用于具体的函数逻辑。
 *  execute方法首先调用doExecute方法来执行当前节点的逻辑，如果能够处理当前参数，则返回处理结果。否则，它将尝试将参数传递给下一个节点，直到找到能够处理参数的节点为止。
 *  使用责任链模式可以很方便地添加新的函数节点，并且可以随意修改节点之间的关系。
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/18
 *  @Param
 *  @Return
 *  @File           libs/util/src/lib/task
 *  @Update         [time:user] 某用户更新此文件
 * */

import { ChainStatus, ChainNode } from './type';

/**
 * 任务链需继承该类，并提供doExecute方法来执行当前节点的逻辑
 * 可以通过setNext添加子任务链节点
 */
export abstract class ChainNodeExecutor<T extends Array<unknown> = any> implements ChainNode {
    // 用于判断变量是否继承FeatureExecutor的标识符
    static readonly identifying = true;

    status: ChainStatus = ChainStatus.waiting;

    // 如果需要监听用户取消 重写此方法
    cancel() {
        this.status = ChainStatus.cancel;
        this.destroy();
    }

    async execute(...args: unknown[]) {
        this.status = ChainStatus.starting;
        try {
            const result = await this.doExecute(...args);
            console.log('result', result);
            if (this.status === ChainStatus.starting) this.status = ChainStatus.complete;
            return result;
        } catch (e) {
            this.status = ChainStatus.error;
            throw e;
        }
    }

    // 这里定义具体的函数逻辑
    // 如果能够处理当前参数，则返回处理结果，否则返回undefined
    // 结果为【】时 下一个程序使用a,b,c接受参数
    abstract doExecute(...args: unknown[]): Promise<T[] | void>;

    // 整个任务链完成时的回调，如果需要监听 重写此方法
    complete() {
        this.destroy();
    }

    // 重置状态到初始值的回调
    abstract reset(): void;

    // 组件销毁时的生命周期
    abstract destroy(): void;
}
