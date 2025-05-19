import { delay } from './tools';

/**
 * 根据字符串返回一个date对象
 * 比如1hour 代表一小时
 * @param timeString '1hour 1minute'
 */
export function parseTimeString(timeString: string) {
    const comparisonTable = {
        hour: 3600000,
        minute: 60000,
        second: 1000
    };
    const regex = /^(\d+)(hour|minute|second)s?$/;
    const match = timeString.match(regex);
    if (!match) throw new Error('传入的时间字符串不合法');

    const [, value, unit] = match;
    const milliseconds = Number(value) * comparisonTable[unit]; // 1 hour = 3600000 milliseconds, 1 minute = 60000 milliseconds
    return new Date(milliseconds);
}

/**
 * 检测两次时间的间隔是否满足条件，如果不满足则等待
 */
export class DetectionInterval {
    startDate?: number;

    // 等待的时间 毫秒
    constructor(public interval = 5 * 1000) {}

    // 开始计时
    start(interval?: number) {
        this.startDate = Date.now();
        if (interval) this.interval = interval;
    }

    // 检测时间间隔是否满足条件
    async detection() {
        if (!this.startDate) throw new Error('start() must be called before detection()');
        const current = Date.now();
        const duration = current - this.startDate;
        if (duration >= this.interval) return;
        await delay(this.interval - duration);
    }
}
