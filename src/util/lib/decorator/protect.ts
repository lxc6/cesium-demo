import { Print } from '../../index';

/**
 * 保证成员参数仅可写入max次
 * 如果传入1 则表示为readonly的效果
 * @param max
 */
export function onceWritable(max = 2) {
    return function fn(target: any, propertyKey: string) {
        let value = target[propertyKey];
        let writeCount = 0;
        const getter = () => {
            return value;
        };

        const setter = (newVal: unknown) => {
            console.log(writeCount, '执行次数', propertyKey);
            if (writeCount >= max) {
                Print.Warn(`此成员参数受到保护，仅可写入${max}次`);
                return;
            }
            value = newVal;
            writeCount += 1;
        };

        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true,
        });
    };
}
