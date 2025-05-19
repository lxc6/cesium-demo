import { ChainNodeExecutor } from '@/util';

export enum MeasureMode {
    DISTANCE,
}

// 暂时无用
export class Measure extends ChainNodeExecutor {
    destroy(): void {
        //
    }

    doExecute(args: unknown): Promise<any[] | void> {
        return Promise.resolve(undefined);
    }

    reset(): void {
        //
    }
}
