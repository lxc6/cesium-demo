/**
 * 对象池
 * 用于管理和重用对象，减少内存分配和垃圾回收
 */
export interface ObjectPoolOptions<T> {
    /** 创建对象的函数 */
    createFn: () => T;
    /** 重置对象的函数，在对象被重用前调用 */
    resetFn?: (obj: T) => T;
    /** 初始池大小 */
    initialSize?: number;
    /** 最大池大小，超过此大小的对象将被丢弃 */
    maxSize?: number;
}

export class ObjectPool<T> {
    private pool: T[] = [];
    private createFn: () => T;
    private resetFn?: (obj: T) => T;
    private maxSize: number;

    /**
     * 构造函数
     * @param options 对象池配置选项
     */
    constructor(options: ObjectPoolOptions<T>) {
        this.createFn = options.createFn;
        this.resetFn = options.resetFn;
        this.maxSize = options.maxSize || 100;

        // 预创建对象
        const initialSize = options.initialSize || 0;
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    /**
     * 从池中获取一个对象
     * 如果池为空，则创建新对象
     * @returns 对象实例
     */
    get(): T {
        if (this.pool.length > 0) {
            const obj = this.pool.pop()!;
            return this.resetFn ? this.resetFn(obj) : obj;
        }
        return this.createFn();
    }

    /**
     * 将对象归还到池中
     * 如果池已满，对象将被丢弃
     * @param obj 要归还的对象
     */
    release(obj: T): void {
        if (this.pool.length < this.maxSize) {
            this.pool.push(obj);
        }
    }

    /**
     * 批量获取多个对象
     * @param count 要获取的对象数量
     * @returns 对象数组
     */
    getMultiple(count: number): T[] {
        const result: T[] = [];
        for (let i = 0; i < count; i++) {
            result.push(this.get());
        }
        return result;
    }

    /**
     * 批量归还多个对象
     * @param objects 要归还的对象数组
     */
    releaseMultiple(objects: T[]): void {
        objects.forEach((obj) => this.release(obj));
    }

    /**
     * 清空对象池
     */
    clear(): void {
        this.pool = [];
    }

    /**
     * 获取当前池中对象数量
     * @returns 对象数量
     */
    size(): number {
        return this.pool.length;
    }

    /**
     * 预热对象池，创建指定数量的对象
     * @param count 要预创建的对象数量
     */
    prewarm(count: number): void {
        const needed = Math.min(count, this.maxSize) - this.pool.length;
        for (let i = 0; i < needed; i++) {
            this.pool.push(this.createFn());
        }
    }
}
