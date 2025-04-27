/**
 * 任务控制器
 * 用于管理异步任务的执行和控制
 */
export class TaskControl<T extends any[]> {
    private tasks: Map<string, (...args: T) => Promise<any>> = new Map();
    private runningTasks: Map<string, Promise<any>> = new Map();
    private enabled: boolean;
    private context: T;

    /**
     * 构造函数
     * @param context 任务执行上下文
     * @param enabled 是否启用任务控制器
     */
    constructor(context: T, enabled = true) {
        this.context = context;
        this.enabled = enabled;
    }

    /**
     * 注册任务
     * @param name 任务名称
     * @param task 任务函数
     */
    register(name: string, task: (...args: T) => Promise<any>): void {
        this.tasks.set(name, task);
    }

    /**
     * 执行任务
     * @param name 任务名称
     * @returns 任务执行结果Promise
     */
    async run(name: string): Promise<any> {
        if (!this.enabled) {
            console.warn(`任务控制器已禁用，无法执行任务: ${name}`);
            return Promise.resolve(null);
        }

        const task = this.tasks.get(name);
        if (!task) {
            console.error(`未找到任务: ${name}`);
            return Promise.reject(new Error(`未找到任务: ${name}`));
        }

        // 如果任务已在运行，返回现有Promise
        if (this.runningTasks.has(name)) {
            return this.runningTasks.get(name);
        }

        try {
            const taskPromise = task(...this.context);
            this.runningTasks.set(name, taskPromise);

            const result = await taskPromise;
            this.runningTasks.delete(name);
            return result;
        } catch (error) {
            this.runningTasks.delete(name);
            console.error(`任务执行失败: ${name}`, error);
            throw error;
        }
    }

    /**
     * 取消任务
     * @param name 任务名称
     */
    cancel(name: string): void {
        this.runningTasks.delete(name);
    }

    /**
     * 取消所有任务
     */
    cancelAll(): void {
        this.runningTasks.clear();
    }

    /**
     * 启用任务控制器
     */
    enable(): void {
        this.enabled = true;
    }

    /**
     * 禁用任务控制器
     */
    disable(): void {
        this.enabled = false;
        this.cancelAll();
    }

    /**
     * 获取任务列表
     * @returns 任务名称数组
     */
    getTaskList(): string[] {
        return Array.from(this.tasks.keys());
    }

    /**
     * 获取正在运行的任务列表
     * @returns 正在运行的任务名称数组
     */
    getRunningTaskList(): string[] {
        return Array.from(this.runningTasks.keys());
    }
}
