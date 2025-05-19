/**
 *  ---------------------------objectPool.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    当我们需要频繁创建和销毁对象时，使用对象池可以提高性能并降低内存开销。下面是一个TypeScript 对象池的实现：
 *  需要注意的是并非所有对象都适合拿来池化――因为维护对象池也要造成一定开销。
 *  对生成时开销不大的对象进行池化，反而可能会出现“维护对象池的开销”大于“生成新对象的开销”，从而使性能降低的情况。
 *  但是对于生成时开销可观的对象，池化技术就是提高性能的有效策略了。
 *
 *  关于性能：
 *    这个类的性能开销主要来自于对象池中对象的创建、存储和释放过程，以及互斥锁的加锁和解锁操作。
 *    如果对象池中的对象数量很少，或者使用场景不需要频繁地获取和释放对象，则可能会造成一定的性能开销。
 *
 *  推荐使用场景包括：
 *
 *    高并发场景：在高并发场景下，如果需要频繁地创建和释放对象，则可以使用对象池来减少对象创建的次数，并提高代码的性能和响应速度。
 *
 *    大对象或昂贵对象：如果需要创建比较大或者昂贵的对象，例如数据库连接、网络连接等，则可以使用对象池来缓存这些对象，避免重复创建和销毁浪费资源。
 *
 *    周期性任务：如果需要执行周期性任务，并且每个任务需要使用相同类型的对象，则可以使用对象池来缓存对象，避免在每个任务执行时都创建和销毁对象。
 *
 *    推荐使用对象池的阈值根据具体情况而定，可以根据对象池的性能测试结果和场景需求进行评估和调整。
 *
 *    一般来说，当对象池中的对象数量超过 100 个或者对象的创建和销毁时间大于 1 毫秒时，使用对象池可以带来明显的性能优化效果。
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/20
 *  @Param
 *  @Return
 *  @File           libs/util/src/lib/memory optimization
 *  @Update         [time:user] 某用户更新此文件
 * */
// 创建对象的函数
type CreateFn<T> = () => T;
// 重置对象时为对象提供默认值
type ResetFn<T> = (obj: T) => void;

export class ObjectPool<T> {
    // 存储对象池中的所有对象
    private readonly objects: T[] = [];

    // 创建对象所需的函数
    private readonly createFn: CreateFn<T>;

    // 重置对象状态所需的函数（可选）
    private readonly resetFn?: ResetFn<T>;

    // 添加默认创建数量和最大创建数量属性
    private readonly defaultSize: number;

    private readonly maxSize: number;

    // 添加对象数量计数器和报警阈值
    private objectCount = 0;

    // 构造函数
    constructor(options: {
        createFn: CreateFn<T>;
        resetFn?: ResetFn<T>;
        defaultSize?: number;
        maxSize?: number;
    }) {
        this.createFn = options.createFn;
        this.resetFn = options.resetFn;
        this.defaultSize = options.defaultSize || 20;
        this.maxSize = options.maxSize || this.defaultSize * 2;

        this.preload(this.defaultSize);
    }

    // 获取一个可用的对象
    getObject(): T {
        // 如果对象池中有可用对象，则弹出最后一个对象并返回
        const obj = this.objects.pop() ?? this.createFn();

        // 检查对象数量是否已达到报警阈值，如果是则触发报警机制
        this.objectCount++;
        if (this.objectCount >= this.maxSize) {
            console.warn(`Object pool has reached the alarm threshold of ${this.maxSize}.`);
        }

        return obj;
    }

    // 将对象释放回对象池中
    releaseObject(obj: T): void {
        // 如果定义了 resetFn 函数，则在释放对象之前调用该函数以重置对象状态
        if (this.resetFn) {
            this.resetFn(obj);
        }

        // 检查对象池是否已满，如果未满则将对象推回对象池中等待下次使用
        if (this.objects.length < this.maxSize) {
            this.objects.push(obj);
            this.objectCount--;
        }
    }

    // 获取对象池中可用对象的数量
    get size(): number {
        return this.objects.length;
    }

    // 清空对象池中的所有对象
    clear(): void {
        this.objects.length = 0;
    }

    // 预先加载指定数量的对象到对象池中
    preload(amount: number): void {
        for (let i = 0; i < amount; i++) {
            const obj = this.createFn();
            this.objects.push(obj);
        }

        // 更新对象数量计数器
        this.objectCount += amount;

        // 检查对象数量是否已达到报警阈值，如果是则触发报警机制
        if (this.objectCount >= this.maxSize) {
            console.warn(`Object pool has reached the alarm threshold of ${this.maxSize}.`);
        }
    }
}
